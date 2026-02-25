import type { LucideIcon } from 'lucide-react'
import type { ParaType } from '@/types/enums'

export type NavItemConfig = {
  icon: LucideIcon
  label: string
  href: string
  shortcut?: string
}

export type BucketTreeItem = {
  id: string
  name: string
  paraType: ParaType
  noteCount: number
  children: BucketTreeItem[]
}
