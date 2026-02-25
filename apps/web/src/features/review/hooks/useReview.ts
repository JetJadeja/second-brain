import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToastStore } from '@/stores/toast.store'
import { reviewService } from '../services/review.service'
import type { ReviewData, ReviewSection, ProjectItem } from '../types/review.types'

const STORAGE_KEY = 'second-brain-last-reviewed'
const ALL_SECTIONS: ReviewSection[] = ['inbox', 'projects', 'areas', 'connections', 'orphans', 'distillation']

function loadLastReviewed(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

function saveLastReviewed(): void {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString())
}

export function useReview() {
  const toast = useToastStore((s) => s.toast)
  const [data, setData] = useState<ReviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastReviewed, setLastReviewed] = useState<string | null>(loadLastReviewed)
  const [completion, setCompletion] = useState<Record<ReviewSection, boolean>>({
    inbox: false, projects: false, areas: true, connections: false, orphans: false, distillation: false,
  })
  const [reviewedProjects, setReviewedProjects] = useState<Set<string>>(new Set())
  const [dismissedConnections, setDismissedConnections] = useState<Set<string>>(new Set())
  const [actedOrphans, setActedOrphans] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    reviewService.getReviewData().then((result) => {
      if (cancelled) return
      setData(result)
      setIsLoading(false)
      if (result.inbox_count === 0) setCompletion((c) => ({ ...c, inbox: true }))
      if (result.connections.length === 0) setCompletion((c) => ({ ...c, connections: true }))
      if (result.orphans.length === 0) setCompletion((c) => ({ ...c, orphans: true }))
      if (result.nudges.length === 0) setCompletion((c) => ({ ...c, distillation: true }))
    })
    return () => { cancelled = true }
  }, [])

  const markProjectReviewed = useCallback((project: ProjectItem) => {
    setReviewedProjects((prev) => new Set(prev).add(project.id))
  }, [])

  const archiveProject = useCallback(async (project: ProjectItem) => {
    try {
      await reviewService.archiveProject(project.id)
      setReviewedProjects((prev) => new Set(prev).add(project.id))
      toast({ type: 'success', message: `Archived "${project.name}"` })
    } catch {
      toast({ type: 'error', message: 'Failed to archive project' })
    }
  }, [toast])

  const connectNotes = useCallback(async (suggestionId: string, noteAId: string, noteBId: string) => {
    try {
      await reviewService.connectNotes(noteAId, noteBId)
      setDismissedConnections((prev) => new Set(prev).add(suggestionId))
      toast({ type: 'success', message: 'Notes connected' })
    } catch {
      toast({ type: 'error', message: 'Failed to connect notes' })
    }
  }, [toast])

  const dismissSuggestion = useCallback(async (suggestionId: string) => {
    try {
      await reviewService.dismissSuggestion(suggestionId)
      setDismissedConnections((prev) => new Set(prev).add(suggestionId))
    } catch {
      toast({ type: 'error', message: 'Failed to dismiss suggestion' })
    }
  }, [toast])

  const archiveOrphan = useCallback(async (noteId: string) => {
    try {
      await reviewService.archiveNote(noteId)
      setActedOrphans((prev) => new Set(prev).add(noteId))
      toast({ type: 'success', message: 'Note archived' })
    } catch {
      toast({ type: 'error', message: 'Failed to archive note' })
    }
  }, [toast])

  const markOrphanActed = useCallback((noteId: string) => {
    setActedOrphans((prev) => new Set(prev).add(noteId))
  }, [])

  // Update section completion based on acted items
  useEffect(() => {
    if (!data) return
    const allProjectsDone = data.projects.length > 0 && data.projects.every((p) => reviewedProjects.has(p.id))
    const allConnectionsDone = data.connections.length > 0 && data.connections.every((c) => dismissedConnections.has(c.id))
    const allOrphansDone = data.orphans.length > 0 && data.orphans.every((o) => actedOrphans.has(o.id))
    setCompletion((c) => ({
      ...c,
      projects: data.projects.length === 0 || allProjectsDone,
      connections: data.connections.length === 0 || allConnectionsDone,
      orphans: data.orphans.length === 0 || allOrphansDone,
    }))
  }, [data, reviewedProjects, dismissedConnections, actedOrphans])

  const isAllComplete = useMemo(() => ALL_SECTIONS.every((s) => completion[s]), [completion])

  useEffect(() => {
    if (isAllComplete && data) {
      saveLastReviewed()
      setLastReviewed(new Date().toISOString())
    }
  }, [isAllComplete, data])

  const sectionCounts = useMemo(() => {
    if (!data) return { inbox: 0, projects: 0, areas: 0, connections: 0, orphans: 0, distillation: 0 }
    return {
      inbox: data.inbox_count,
      projects: data.projects.length,
      areas: data.areas.length,
      connections: data.connections.filter((c) => !dismissedConnections.has(c.id)).length,
      orphans: data.orphans.filter((o) => !actedOrphans.has(o.id)).length,
      distillation: data.nudges.length,
    }
  }, [data, dismissedConnections, actedOrphans])

  return {
    data, isLoading, lastReviewed, completion, isAllComplete, sectionCounts,
    markProjectReviewed, archiveProject, connectNotes, dismissSuggestion,
    archiveOrphan, markOrphanActed, reviewedProjects, dismissedConnections, actedOrphans,
  }
}
