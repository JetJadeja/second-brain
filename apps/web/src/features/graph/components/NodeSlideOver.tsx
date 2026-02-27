import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { SourceIcon } from '@/components/shared/SourceIcon'
import { ParaDot } from '@/components/shared/ParaDot'
import type { GraphNode } from '../types/graph.types'

type NodeSlideOverProps = {
  node: GraphNode | null
  onClose: () => void
}

export function NodeSlideOver({ node, onClose }: NodeSlideOverProps) {
  const navigate = useNavigate()

  if (!node) return null

  const excerpt = getExcerpt(node)

  return (
    <div className="absolute right-0 top-0 z-20 flex h-full w-[300px] flex-col border-l border-surface-200 bg-surface-100 p-4 animate-in slide-in-from-right duration-200">
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 text-surface-300 transition-colors hover:text-surface-400"
        aria-label="Close panel"
      >
        <X size={16} />
      </button>

      {/* Title */}
      <h3 className="pr-6 font-title-sm text-surface-700">{node.title}</h3>

      {/* Source type */}
      <div className="mt-2 flex items-center gap-1.5">
        <SourceIcon sourceType={node.source_type} size={14} />
        <span className="text-body-sm text-surface-400">{node.source_type}</span>
      </div>

      {/* PARA location */}
      {node.para_type && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <ParaDot type={node.para_type} size={8} />
          <span className="text-caption text-surface-400">{node.para_type}</span>
        </div>
      )}

      {/* Excerpt */}
      {excerpt && (
        <p className="mt-3 line-clamp-6 text-body-sm text-surface-400">{excerpt}</p>
      )}

      {/* Stats */}
      <p className="mt-3 text-caption text-surface-300">
        {node.connection_count} connection{node.connection_count !== 1 ? 's' : ''}
      </p>

      {/* Open full */}
      <button
        onClick={() => navigate(`/notes/${node.id}`)}
        className="mt-4 text-left text-body-sm text-ember-500 hover:underline"
      >
        Open full ↗
      </button>
    </div>
  )
}

function getExcerpt(node: GraphNode): string | null {
  const text = node.distillation ?? node.ai_summary ?? node.original_content
  if (!text) return null
  return text.length > 200 ? text.slice(0, 200) + '…' : text
}
