import { Plus, Minus, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParaFilter } from '../types/graph.types'

type GraphControlsProps = {
  zoom: number
  activeFilters: Set<ParaFilter>
  onZoomIn: () => void
  onZoomOut: () => void
  onFitAll: () => void
  onToggleFilter: (filter: ParaFilter) => void
}

const FILTER_COLORS: Array<{ key: ParaFilter; color: string }> = [
  { key: 'project', color: 'bg-ember-500' },
  { key: 'area', color: 'bg-green-500' },
  { key: 'resource', color: 'bg-amber-500' },
  { key: 'archive', color: 'bg-surface-300' },
]

export function GraphControls({
  activeFilters, onZoomIn, onZoomOut, onFitAll, onToggleFilter,
}: GraphControlsProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-0 rounded-lg bg-surface-100 p-2 shadow-lg">
      {/* Zoom controls */}
      <ControlButton icon={<Plus size={14} />} onClick={onZoomIn} label="Zoom in" />
      <ControlButton icon={<Minus size={14} />} onClick={onZoomOut} label="Zoom out" />
      <ControlButton icon={<Maximize2 size={14} />} onClick={onFitAll} label="Fit all" />

      {/* Divider */}
      <div className="my-1.5 h-px bg-surface-200" />

      {/* PARA filters */}
      <div className="flex items-center justify-center gap-2 px-1">
        {FILTER_COLORS.map(({ key, color }) => {
          const isActive = activeFilters.size === 0 || activeFilters.has(key)
          return (
            <button
              key={key}
              onClick={() => onToggleFilter(key)}
              className={cn('h-3 w-3 rounded-full transition-opacity', color, !isActive && 'opacity-30')}
              title={key}
            />
          )
        })}
      </div>
    </div>
  )
}

type ControlButtonProps = {
  icon: React.ReactNode
  onClick: () => void
  label: string
}

function ControlButton({ icon, onClick, label }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded text-surface-300 transition-colors hover:bg-surface-150 hover:text-surface-400"
    >
      {icon}
    </button>
  )
}
