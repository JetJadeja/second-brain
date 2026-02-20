import { useQuery } from '@tanstack/react-query'
import type { NoteDetailResponse } from '../lib/types'
import { apiGet } from '../lib/api-client'

export function useNote(noteId: string | undefined) {
  return useQuery<NoteDetailResponse>({
    queryKey: ['note', noteId],
    queryFn: () => apiGet<NoteDetailResponse>(`/api/notes/${noteId}`),
    enabled: !!noteId,
  })
}
