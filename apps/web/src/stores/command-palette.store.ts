import { create } from 'zustand'
import type { SearchMode } from '@/features/command-palette/types/command-palette.types'

type CommandPaletteStore = {
  isOpen: boolean
  scopedBucketId: string | null
  scopedBucketName: string | null
  initialMode: SearchMode | null
  openPalette: (opts?: { bucketId?: string; bucketName?: string; mode?: SearchMode }) => void
  closePalette: () => void
}

export const useCommandPaletteStore = create<CommandPaletteStore>()((set) => ({
  isOpen: false,
  scopedBucketId: null,
  scopedBucketName: null,
  initialMode: null,

  openPalette(opts): void {
    set({
      isOpen: true,
      scopedBucketId: opts?.bucketId ?? null,
      scopedBucketName: opts?.bucketName ?? null,
      initialMode: opts?.mode ?? null,
    })
  },

  closePalette(): void {
    set({
      isOpen: false,
      scopedBucketId: null,
      scopedBucketName: null,
      initialMode: null,
    })
  },
}))
