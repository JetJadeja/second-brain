import { useState, useCallback, useMemo } from 'react'
import type { GraphEdge, ParaFilter } from '../types/graph.types'

type UseGraphInteractionReturn = {
  selectedNodeId: string | null
  hoveredNodeId: string | null
  activeFilters: Set<ParaFilter>
  timeValue: number
  isFullscreen: boolean
  zoom: number
  panX: number
  panY: number
  connectedNodeIds: Set<string>
  selectNode: (id: string | null) => void
  hoverNode: (id: string | null) => void
  toggleFilter: (filter: ParaFilter) => void
  setTimeValue: (value: number) => void
  toggleFullscreen: () => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  zoomIn: () => void
  zoomOut: () => void
}

export function useGraphInteraction(edges: GraphEdge[]): UseGraphInteractionReturn {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<ParaFilter>>(new Set())
  const [timeValue, setTimeValue] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>()
    const ids = new Set<string>()
    ids.add(hoveredNodeId)
    for (const edge of edges) {
      if (edge.source_id === hoveredNodeId) ids.add(edge.target_id)
      if (edge.target_id === hoveredNodeId) ids.add(edge.source_id)
    }
    return ids
  }, [hoveredNodeId, edges])

  const selectNode = useCallback((id: string | null) => setSelectedNodeId(id), [])
  const hoverNode = useCallback((id: string | null) => setHoveredNodeId(id), [])

  const toggleFilter = useCallback((filter: ParaFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }, [])

  const toggleFullscreen = useCallback(() => setIsFullscreen((v) => !v), [])

  const setPan = useCallback((x: number, y: number) => {
    setPanX(x)
    setPanY(y)
  }, [])

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 4)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.1)), [])

  return {
    selectedNodeId, hoveredNodeId, activeFilters, timeValue,
    isFullscreen, zoom, panX, panY, connectedNodeIds,
    selectNode, hoverNode, toggleFilter, setTimeValue,
    toggleFullscreen, setZoom, setPan, zoomIn, zoomOut,
  }
}
