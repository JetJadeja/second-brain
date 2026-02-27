import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PARA_LABELS } from '@/types/enums'
import type { ParaType } from '@/types/enums'
import { SidebarBucketItem } from './SidebarBucketItem'
import type { BucketTreeItem } from './types'

const PARA_ORDER: ParaType[] = ['project', 'area', 'resource', 'archive']
const CREATABLE_TYPES: ParaType[] = ['project', 'area']

export type SidebarParaSectionProps = {
  buckets: BucketTreeItem[]
  collapsed: boolean
}

export function SidebarParaSection({ buckets, collapsed }: SidebarParaSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string): void {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const grouped = PARA_ORDER.map((paraType) => ({
    paraType,
    label: PARA_LABELS[paraType].toUpperCase() + 'S',
    items: buckets.filter((b) => b.paraType === paraType),
    canCreate: CREATABLE_TYPES.includes(paraType),
  }))

  const visibleGroups = grouped

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {visibleGroups.map((group) => (
        <div key={group.paraType} className="mb-1">
          {!collapsed && (
            <SectionHeader
              label={group.label}
              canCreate={group.canCreate}
            />
          )}
          {group.items.map((bucket) => (
            <BucketTree
              key={bucket.id}
              bucket={bucket}
              depth={0}
              collapsed={collapsed}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
      ))}

    </div>
  )
}

function SectionHeader({ label, canCreate }: { label: string; canCreate: boolean }) {
  return (
    <div className="group flex items-center h-7 px-2">
      <span className="font-overline text-surface-300">{label}</span>
      {canCreate && (
        <button
          type="button"
          disabled
          className="ml-auto opacity-0 group-hover:opacity-50 text-surface-300 cursor-not-allowed transition-opacity duration-[120ms]"
          aria-label={`Create new ${label.toLowerCase().slice(0, -1)}`}
          title="Coming soon"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  )
}

function BucketTree({
  bucket,
  depth,
  collapsed,
  expandedIds,
  onToggleExpand,
}: {
  bucket: BucketTreeItem
  depth: number
  collapsed: boolean
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
}) {
  const isExpanded = expandedIds.has(bucket.id)

  return (
    <>
      <SidebarBucketItem
        bucket={bucket}
        depth={depth}
        collapsed={collapsed}
        isExpanded={isExpanded}
        onToggleExpand={() => onToggleExpand(bucket.id)}
      />
      {isExpanded &&
        bucket.children.map((child) => (
          <BucketTree
            key={child.id}
            bucket={child}
            depth={depth + 1}
            collapsed={collapsed}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
          />
        ))}
    </>
  )
}
