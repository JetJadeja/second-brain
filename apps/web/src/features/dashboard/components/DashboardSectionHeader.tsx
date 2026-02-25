import type { LucideIcon } from 'lucide-react'

type DashboardSectionHeaderProps = {
  icon: LucideIcon
  label: string
}

export function DashboardSectionHeader({ icon: Icon, label }: DashboardSectionHeaderProps) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <Icon size={14} className="text-surface-300" />
      <span className="font-overline text-surface-300 uppercase tracking-[0.06em]">{label}</span>
    </div>
  )
}
