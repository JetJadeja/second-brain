import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ParaDot } from '@/components/shared/ParaDot'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { BucketTreeItem } from './types'

export type SidebarBucketItemProps = {
  bucket: BucketTreeItem
  depth: number
  collapsed: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function SidebarBucketItem({
  bucket,
  depth,
  collapsed,
  isExpanded = false,
  onToggleExpand,
}: SidebarBucketItemProps) {
  const { pathname } = useLocation()
  const href = `/buckets/${bucket.id}`
  const isActive = pathname === href
  const hasChildren = bucket.children.length > 0
  const isEmpty = !hasChildren && bucket.noteCount === 0

  const content = (
    <Link
      to={href}
      className={cn(
        'group relative flex items-center gap-2 rounded-sm h-9 transition-colors duration-[120ms] ease-out',
        'focus-ring',
        isActive
          ? 'bg-surface-150 text-surface-700'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-600',
        isEmpty && 'opacity-40',
        collapsed ? 'justify-center px-0' : 'pr-3',
      )}
      style={collapsed ? undefined : { paddingLeft: 16 + depth * 20 }}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-ember-500 rounded-r-full animate-[slide-in-left_200ms_var(--ease-out)]" />
      )}

      {hasChildren && !collapsed && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleExpand?.()
          }}
          className="shrink-0 text-surface-300 hover:text-surface-500 transition-transform duration-150 ease-out"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight size={8} className={cn('transition-transform duration-150', isExpanded && 'rotate-90')} />
        </button>
      )}

      <ParaDot type={bucket.paraType} dimmed={isEmpty} />

      {!collapsed && (
        <>
          <span className="flex-1 font-body truncate">{bucket.name}</span>
          {bucket.noteCount > 0 && (
            <span className="shrink-0 font-mono text-[12px] text-surface-300">{bucket.noteCount}</span>
          )}
        </>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="bg-surface-100 text-surface-600 font-body-sm rounded-sm">
          {bucket.name}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
