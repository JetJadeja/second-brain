import { useState, useRef, useEffect } from 'react'
import { useParaTree } from '../../hooks/use-para-tree'
import type { ParaTreeNode } from '../../lib/types'

interface ParaPickerProps {
  onSelect: (bucketId: string, bucketPath: string) => void
  onClose: () => void
}

function matchesSearch(node: ParaTreeNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true
  return node.children.some((child) => matchesSearch(child, query))
}

function BucketNode({
  node,
  depth,
  path,
  query,
  onSelect,
}: {
  node: ParaTreeNode
  depth: number
  path: string
  query: string
  onSelect: (bucketId: string, bucketPath: string) => void
}) {
  const currentPath = path ? `${path}/${node.name}` : node.name
  const isRoot = node.parent_id === null

  if (query && !matchesSearch(node, query.toLowerCase())) return null

  return (
    <>
      {isRoot ? (
        <div
          className="w-full text-left px-3 py-1.5 text-xs font-semibold uppercase text-text-tertiary tracking-wide"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {node.name}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelect(node.id, currentPath)}
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-hover rounded flex items-center gap-2"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <span className="text-text-primary truncate">{node.name}</span>
          <span className="text-xs text-text-tertiary ml-auto">{node.note_count}</span>
        </button>
      )}
      {node.children.map((child) => (
        <BucketNode
          key={child.id}
          node={child}
          depth={depth + 1}
          path={currentPath}
          query={query}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

export function ParaPicker({ onSelect, onClose }: ParaPickerProps) {
  const [query, setQuery] = useState('')
  const { data } = useParaTree()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const tree = data?.tree ?? []

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 w-72 bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-2 border-b border-border">
        <input
          type="text"
          placeholder="Search buckets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-transparent border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring text-text-primary placeholder:text-text-tertiary"
          autoFocus
        />
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {tree.map((node) => (
          <BucketNode
            key={node.id}
            node={node}
            depth={0}
            path=""
            query={query.toLowerCase()}
            onSelect={onSelect}
          />
        ))}
        {tree.length === 0 && (
          <p className="px-3 py-4 text-sm text-text-tertiary text-center">No buckets found</p>
        )}
      </div>
    </div>
  )
}
