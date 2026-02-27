import { useRef, useEffect, useCallback } from 'react'
import type { GraphEdge, SimNode, ParaFilter } from '../types/graph.types'
import { drawNode, drawEdge, drawLabel, hitTest, nodeRadius, getNodeColor } from '../lib/graph-render'

type GraphCanvasProps = {
  nodes: SimNode[]
  edges: GraphEdge[]
  hoveredNodeId: string | null
  selectedNodeId: string | null
  connectedNodeIds: Set<string>
  activeFilters: Set<ParaFilter>
  zoom: number
  panX: number
  panY: number
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  onPan: (x: number, y: number) => void
  onZoom: (z: number) => void
}

export function GraphCanvas({
  nodes, edges, hoveredNodeId, selectedNodeId, connectedNodeIds,
  activeFilters, zoom, panX, panY, onHover, onSelect, onPan, onZoom,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const maxConn = Math.max(...nodes.map((n) => n.connection_count), 1)

  const radiusFn = useCallback((n: SimNode) => nodeRadius(n.connection_count, maxConn), [maxConn])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.translate(panX + w / 2, panY + h / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(-w / 2, -h / 2)

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const hasFilters = activeFilters.size > 0
    const hasHover = hoveredNodeId !== null

    // Draw edges
    for (const edge of edges) {
      const src = nodeMap.get(edge.source_id)
      const tgt = nodeMap.get(edge.target_id)
      if (!src || !tgt) continue
      const highlighted = hasHover && connectedNodeIds.has(src.id) && connectedNodeIds.has(tgt.id)
      const color = highlighted ? getNodeColor(src.para_type) : undefined
      drawEdge(ctx, src.x, src.y, tgt.x, tgt.y, {
        dashed: edge.type === 'ai_detected', highlighted, color,
      })
    }

    // Draw nodes
    for (const node of nodes) {
      const r = radiusFn(node)
      const color = getNodeColor(node.para_type)
      const isOrphan = node.connection_count === 0
      const dimmedByFilter = hasFilters && node.para_type !== null && !activeFilters.has(node.para_type)
      const dimmedByHover = hasHover && !connectedNodeIds.has(node.id)
      drawNode(ctx, node.x, node.y, r, color, {
        hovered: node.id === hoveredNodeId,
        selected: node.id === selectedNodeId,
        dimmed: dimmedByFilter || dimmedByHover,
        orphan: isOrphan,
      })

      // Labels based on zoom
      if (zoom > 0.5) {
        const labelOpacity = zoom < 1 ? (zoom - 0.5) * 2 : 1
        const labelColor = node.id === hoveredNodeId ? '#C4BAC0' : '#8A7D84'
        drawLabel(ctx, node.title, node.x, node.y + r + 14, { opacity: labelOpacity, color: labelColor })
      }
    }

    ctx.restore()
  }, [nodes, edges, hoveredNodeId, selectedNodeId, connectedNodeIds, activeFilters, zoom, panX, panY, radiusFn])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current) {
      onPan(dragRef.current.panX + e.clientX - dragRef.current.startX, dragRef.current.panY + e.clientY - dragRef.current.startY)
      return
    }
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = (e.clientX - rect.left - panX - rect.width / 2) / zoom + rect.width / 2
    const my = (e.clientY - rect.top - panY - rect.height / 2) / zoom + rect.height / 2
    const hit = hitTest(mx, my, nodes, radiusFn)
    onHover(hit?.id ?? null)
  }, [nodes, panX, panY, zoom, radiusFn, onHover, onPan])

  const handleClick = useCallback(() => {
    onSelect(hoveredNodeId)
  }, [hoveredNodeId, onSelect])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!hoveredNodeId) dragRef.current = { startX: e.clientX, startY: e.clientY, panX, panY }
  }, [hoveredNodeId, panX, panY])

  const handleMouseUp = useCallback(() => { dragRef.current = null }, [])

  // Passive: false wheel handler — reads zoom from ref to avoid stale closure
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      onZoom(Math.max(0.1, Math.min(4, zoomRef.current - e.deltaY * 0.001)))
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [onZoom])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-crosshair bg-surface-0"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}
