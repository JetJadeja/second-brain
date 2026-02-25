import { cn } from '@/lib/utils'
import { PARA_COLORS } from '@/constants/para'
import { PARA_LABELS } from '@/types/enums'
import type { ParaType } from '@/types/enums'

export type ParaDotProps = {
  type: ParaType
  size?: number
  dimmed?: boolean
  className?: string
}

export function ParaDot({ type, size = 6, dimmed = false, className }: ParaDotProps) {
  return (
    <span
      className={cn('inline-block shrink-0 rounded-full', dimmed && 'opacity-40', className)}
      style={{ width: size, height: size, backgroundColor: PARA_COLORS[type] }}
      aria-label={PARA_LABELS[type]}
      role="img"
    />
  )
}
