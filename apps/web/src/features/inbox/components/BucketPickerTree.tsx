import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ParaDot } from '@/components/shared/ParaDot'
import { PARA_LABELS } from '@/types/enums'
import type { ParaType } from '@/types/enums'
import type { BucketTreeItem } from '@/components/layout/types'

const PARA_ORDER: ParaType[] = ['project', 'area', 'resource', 'archive']

type BucketPickerTreeProps = {
  buckets: BucketTreeItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function BucketPickerTree({ buckets, selectedId, onSelect }: BucketPickerTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string): void {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const grouped = PARA_ORDER
    .map((type) => ({
      type,
      label: PARA_LABELS[type] + 's',
      items: buckets.filter((b) => b.paraType === type),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-col gap-1">
      {grouped.map((group) => (
        <div key={group.type}>
          <span className="px-2 font-overline text-surface-300">{group.label.toUpperCase()}</span>
          {group.items.map((bucket) => (
            <PickerNode
              key={bucket.id}
              bucket={bucket}
              depth={0}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

type PickerNodeProps = {
  bucket: BucketTreeItem
  depth: number
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
}

function PickerNode({
  bucket, depth, selectedId, expandedIds, onSelect, onToggleExpand,
}: PickerNodeProps) {
  const isSelected = bucket.id === selectedId
  const isExpanded = expandedIds.has(bucket.id)
  const hasChildren = bucket.children.length > 0

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(bucket.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(bucket.id) }}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 text-left text-body-sm transition-colors',
          isSelected ? 'bg-ember-500/10 text-surface-700' : 'text-surface-500 hover:bg-surface-100',
        )}
        style={{ paddingLeft: 8 + depth * 20 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(bucket.id) }}
            className="shrink-0 text-surface-300 hover:text-surface-500"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight size={10} className={cn('transition-transform duration-150', isExpanded && 'rotate-90')} />
          </button>
        ) : (
          <span className="w-[10px] shrink-0" />
        )}
        <ParaDot type={bucket.paraType} size={6} />
        <span className="min-w-0 flex-1 truncate">{bucket.name}</span>
        {isSelected && <span className="mr-2 shrink-0 text-caption text-ember-500">Selected</span>}
      </div>
      {isExpanded && hasChildren && bucket.children.map((child) => (
        <PickerNode
          key={child.id}
          bucket={child}
          depth={depth + 1}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  )
}
