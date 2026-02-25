import { apiClient } from '@/services/api-client'
import type { SearchFilters, SearchResponse, AskResponse, TimeRange } from '../types/command-palette.types'

function timeRangeToDate(range: TimeRange): string | undefined {
  if (range === 'any') return undefined
  const now = new Date()
  const offsets: Record<Exclude<TimeRange, 'any'>, number> = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  }
  const days = offsets[range]
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

function buildApiFilters(filters?: SearchFilters): Record<string, unknown> | undefined {
  if (!filters) return undefined
  const mapped: Record<string, unknown> = {}
  if (filters.sourceType) mapped['source_type'] = filters.sourceType
  if (filters.bucketId) mapped['bucket_id'] = filters.bucketId
  if (filters.distillationStatus) mapped['distillation_status'] = filters.distillationStatus
  if (filters.timeRange && filters.timeRange !== 'any') {
    mapped['after'] = timeRangeToDate(filters.timeRange)
  }
  return Object.keys(mapped).length > 0 ? mapped : undefined
}

export const commandPaletteService = {
  searchNotes(query: string, filters?: SearchFilters, limit = 20): Promise<SearchResponse> {
    return apiClient.post<SearchResponse>('/search', {
      query,
      mode: 'notes',
      filters: buildApiFilters(filters),
      limit,
    })
  },

  askQuestion(query: string, filters?: SearchFilters): Promise<AskResponse> {
    return apiClient.post<AskResponse>('/search', {
      query,
      mode: 'answer',
      filters: buildApiFilters(filters),
    })
  },
}
