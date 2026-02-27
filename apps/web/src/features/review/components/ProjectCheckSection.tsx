import { useState } from 'react'
import { formatRelativeTime } from '@/lib/format-relative-time'
import type { ProjectItem } from '../types/review.types'

type ProjectCheckSectionProps = {
  projects: ProjectItem[]
  reviewedProjects: Set<string>
  onConfirm: (project: ProjectItem) => void
  onArchive: (project: ProjectItem) => void
}

export function ProjectCheckSection({ projects, reviewedProjects, onConfirm, onArchive }: ProjectCheckSectionProps) {
  const [flashingId, setFlashingId] = useState<string | null>(null)

  function handleConfirm(project: ProjectItem) {
    setFlashingId(project.id)
    setTimeout(() => setFlashingId(null), 300)
    onConfirm(project)
  }

  if (projects.length === 0) {
    return <p className="text-sm text-surface-400">No active projects</p>
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isReviewed = reviewedProjects.has(project.id)
        if (isReviewed) return null
        return (
          <div
            key={project.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-300 ${flashingId === project.id ? 'bg-success/10' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-700 truncate">{project.name}</p>
              <p className="text-xs text-surface-400">
                {project.note_count} notes &middot; {formatRelativeTime(project.last_captured_at)}
              </p>
              {project.is_stale && (
                <p className="text-xs text-warning">
                  Inactive for {Math.floor((Date.now() - new Date(project.last_captured_at).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleConfirm(project)}
              className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-success hover:bg-success/10 transition-colors"
            >
              Still active
            </button>
            <button
              type="button"
              onClick={() => onArchive(project)}
              className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-surface-400 hover:bg-surface-200 transition-colors"
            >
              Archive
            </button>
          </div>
        )
      })}
    </div>
  )
}
