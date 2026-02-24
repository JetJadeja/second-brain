import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ParaTreeNode } from '../../lib/types'
import { useExpandedBuckets } from '../../stores/expanded-buckets-store'

interface SidebarTreeItemProps {
  node: ParaTreeNode
  depth: number
}

export function SidebarTreeItem({ node, depth }: SidebarTreeItemProps) {
  const { pathname } = useLocation()
  const expanded = useExpandedBuckets((s) => s.expanded)
  const toggle = useExpandedBuckets((s) => s.toggle)

  const href = `/para/${node.id}`
  const isActive = pathname === href
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.includes(node.id)
  const isEmpty = !hasChildren && node.note_count === 0

  return (
    <div>
      <div
        className="flex items-center group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            className="p-0.5 rounded text-text-tertiary hover:text-text-primary flex-shrink-0"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        <Link
          to={href}
          className={`flex-1 truncate py-1 pl-1 text-sm ${
            isActive ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary'
          } ${isEmpty ? 'opacity-50' : ''}`}
        >
          {node.name}
        </Link>

        {node.note_count > 0 && (
          <span className="text-[10px] text-text-tertiary mr-2">{node.note_count}</span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <SidebarTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
