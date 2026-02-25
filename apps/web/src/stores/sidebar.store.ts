import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SidebarStore = {
  isCollapsed: boolean
  toggleCollapse: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,

      toggleCollapse(): void {
        set((state) => ({ isCollapsed: !state.isCollapsed }))
      },

      setCollapsed(collapsed: boolean): void {
        set({ isCollapsed: collapsed })
      },
    }),
    { name: 'sidebar-collapsed' },
  ),
)
