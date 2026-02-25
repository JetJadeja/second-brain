import { useState, useCallback, useEffect, useRef } from 'react'
import { commandPaletteService } from '../services/command-palette.service'
import type { SearchMode, SearchFilters, SearchResult, AskResponse, CommandPaletteSearchState } from '../types/command-palette.types'

const DEBOUNCE_MS = 150
const QUESTION_PREFIXES = ['what ', 'how ', 'why ', 'when ', 'who ', 'where ', 'summarize ', 'explain ']

function detectMode(query: string): SearchMode {
  const lower = query.toLowerCase().trim()
  if (QUESTION_PREFIXES.some((p) => lower.startsWith(p))) return 'ask'
  if (lower.endsWith('?')) return 'ask'
  return 'notes'
}

export function useCommandPaletteSearch(scopedBucketId?: string | null): CommandPaletteSearchState {
  const [query, setQueryRaw] = useState('')
  const [mode, setModeRaw] = useState<SearchMode>('notes')
  const [filters, setFilters] = useState<SearchFilters>(() =>
    scopedBucketId ? { bucketId: scopedBucketId } : {},
  )
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalFound, setTotalFound] = useState(0)
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pageRef = useRef(1)

  const executeSearch = useCallback(
    async (q: string, m: SearchMode, f: SearchFilters, append: boolean) => {
      const trimmed = q.trim()
      if (!trimmed) return
      setIsSearching(true)
      setError(null)
      try {
        if (m === 'notes') {
          const res = await commandPaletteService.searchNotes(trimmed, f, 20)
          setResults((prev) => (append ? [...prev, ...res.results] : res.results))
          setTotalFound(res.total_found)
        } else {
          const res = await commandPaletteService.askQuestion(trimmed, f)
          setAskResponse(res)
        }
      } catch {
        setError('Search failed — please try again')
      } finally {
        setIsSearching(false)
      }
    },
    [],
  )

  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q)
      const detected = detectMode(q)
      setModeRaw(detected)
      pageRef.current = 1
      setResults([])
      setAskResponse(null)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (!q.trim()) { setIsSearching(false); return }
      timerRef.current = setTimeout(() => executeSearch(q, detected, filters, false), DEBOUNCE_MS)
    },
    [filters, executeSearch],
  )

  const setMode = useCallback(
    (m: SearchMode) => {
      setModeRaw(m)
      setResults([])
      setAskResponse(null)
      pageRef.current = 1
      if (query.trim()) executeSearch(query, m, filters, false)
    },
    [query, filters, executeSearch],
  )

  const setFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value }
        if (query.trim()) {
          setResults([])
          pageRef.current = 1
          executeSearch(query, mode, next, false)
        }
        return next
      })
    },
    [query, mode, executeSearch],
  )

  const clearFilters = useCallback(() => {
    setFilters(scopedBucketId ? { bucketId: scopedBucketId } : {})
  }, [scopedBucketId])

  const loadMore = useCallback(() => {
    pageRef.current += 1
    executeSearch(query, mode, filters, true)
  }, [query, mode, filters, executeSearch])

  const reset = useCallback(() => {
    setQueryRaw('')
    setModeRaw('notes')
    setFilters(scopedBucketId ? { bucketId: scopedBucketId } : {})
    setResults([])
    setTotalFound(0)
    setAskResponse(null)
    setIsSearching(false)
    setError(null)
    pageRef.current = 1
  }, [scopedBucketId])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return {
    query, mode, filters, results, totalFound, askResponse,
    isSearching, error, setQuery, setMode, setFilter, clearFilters, loadMore, reset,
  }
}
