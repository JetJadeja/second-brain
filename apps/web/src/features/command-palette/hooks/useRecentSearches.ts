import { useState, useCallback } from 'react'

const STORAGE_KEY = 'recent-searches'
const MAX_RECENT = 5

function loadSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

function saveSearches(searches: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
}

export function useRecentSearches(): {
  recentSearches: string[]
  addSearch: (query: string) => void
  removeSearch: (query: string) => void
} {
  const [recentSearches, setRecentSearches] = useState<string[]>(loadSearches)

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed)
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT)
      saveSearches(next)
      return next
    })
  }, [])

  const removeSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== query)
      saveSearches(next)
      return next
    })
  }, [])

  return { recentSearches, addSearch, removeSearch }
}
