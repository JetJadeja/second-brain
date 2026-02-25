import type { NoteDetail } from '@/features/note-detail/types/note-detail.types'
import type { DistillTarget } from '../types/distillation.types'
import type { DistillationStatus } from '@/types/enums'

export function computeTarget(status: DistillationStatus): DistillTarget {
  if (status === 'raw' || status === 'key_points') return 'key_points'
  if (status === 'distilled') return 'distilled'
  return 'evergreen'
}

export function parseBullets(note: NoteDetail): string[] {
  if (note.key_points.length > 0) return [...note.key_points]
  if (note.distillation) return note.distillation.split('\n').filter(Boolean)
  return []
}
