import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ExpandedBucketsState {
  expanded: string[]
  toggle: (id: string) => void
  expandAll: (ids: string[]) => void
}

export const useExpandedBuckets = create<ExpandedBucketsState>()(
  persist(
    (set, get) => ({
      expanded: [],
      toggle: (id) => {
        const current = get().expanded
        set({
          expanded: current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id],
        })
      },
      expandAll: (ids) => {
        const current = new Set(get().expanded)
        for (const id of ids) current.add(id)
        set({ expanded: [...current] })
      },
    }),
    { name: 'expanded-buckets' },
  ),
)
