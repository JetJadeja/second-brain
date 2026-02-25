import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useGraphData } from '../hooks/useGraphData'
import { useGraphInteraction } from '../hooks/useGraphInteraction'
import { useGraphSimulation } from '../hooks/useGraphSimulation'
import { GraphCanvas } from './GraphCanvas'
import { GraphControls } from './GraphControls'
import { TimeSlider } from './TimeSlider'
import { NodeSlideOver } from './NodeSlideOver'
import type { ParaFilter } from '../types/graph.types'

export function GraphView() {
  const { nodes, edges, isLoading } = useGraphData()
  const interaction = useGraphInteraction(edges)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevCollapsed = useRef(false)

  const width = containerRef.current?.clientWidth ?? 800
  const height = containerRef.current?.clientHeight ?? 600
  const { simNodes } = useGraphSimulation(nodes, edges, width, height)

  // Date range for time slider
  const dateRange = useMemo(() => {
    if (nodes.length === 0) return { oldest: null, newest: null }
    const dates = nodes.map((n) => n.captured_at).sort()
    return { oldest: dates[0] ?? null, newest: dates[dates.length - 1] ?? null }
  }, [nodes])

  const selectedNode = useMemo(
    () => simNodes.find((n) => n.id === interaction.selectedNodeId) ?? null,
    [simNodes, interaction.selectedNodeId],
  )

  // Fullscreen: collapse sidebar
  useEffect(() => {
    if (interaction.isFullscreen) {
      prevCollapsed.current = useSidebarStore.getState().isCollapsed
      useSidebarStore.getState().setCollapsed(true)
    } else {
      useSidebarStore.getState().setCollapsed(prevCollapsed.current)
    }
  }, [interaction.isFullscreen])

  // Keyboard shortcuts
  useKeyboardShortcut('=', interaction.zoomIn, {})
  useKeyboardShortcut('-', interaction.zoomOut, {})

  const fitAll = useCallback(() => {
    interaction.setZoom(1)
    interaction.setPan(0, 0)
  }, [interaction])

  useKeyboardShortcut('0', fitAll, {})
  useKeyboardShortcut('f', interaction.toggleFullscreen, {})

  const FILTERS: ParaFilter[] = ['project', 'area', 'resource', 'archive']
  useKeyboardShortcut('1', () => interaction.toggleFilter(FILTERS[0]!), {})
  useKeyboardShortcut('2', () => interaction.toggleFilter(FILTERS[1]!), {})
  useKeyboardShortcut('3', () => interaction.toggleFilter(FILTERS[2]!), {})
  useKeyboardShortcut('4', () => interaction.toggleFilter(FILTERS[3]!), {})

  const handleEscape = useCallback(() => {
    if (interaction.selectedNodeId) interaction.selectNode(null)
    else if (interaction.isFullscreen) interaction.toggleFullscreen()
  }, [interaction])
  useKeyboardShortcut('Escape', handleEscape, {})

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-0">
        <p className="text-body text-surface-400">Calculating layout…</p>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-surface-0">
        <p className="text-body text-surface-400">Your knowledge graph is empty.</p>
        <p className="text-body-sm text-surface-300">Send your first note via Telegram to start building.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <GraphCanvas
        nodes={simNodes}
        edges={edges}
        hoveredNodeId={interaction.hoveredNodeId}
        selectedNodeId={interaction.selectedNodeId}
        connectedNodeIds={interaction.connectedNodeIds}
        activeFilters={interaction.activeFilters}
        zoom={interaction.zoom}
        panX={interaction.panX}
        panY={interaction.panY}
        onHover={interaction.hoverNode}
        onSelect={interaction.selectNode}
        onPan={interaction.setPan}
        onZoom={interaction.setZoom}
      />
      <GraphControls
        zoom={interaction.zoom}
        activeFilters={interaction.activeFilters}
        onZoomIn={interaction.zoomIn}
        onZoomOut={interaction.zoomOut}
        onFitAll={fitAll}
        onToggleFilter={interaction.toggleFilter}
      />
      <TimeSlider
        value={interaction.timeValue}
        oldestDate={dateRange.oldest}
        newestDate={dateRange.newest}
        onChange={interaction.setTimeValue}
        onReset={() => interaction.setTimeValue(1)}
      />
      <NodeSlideOver node={selectedNode} onClose={() => interaction.selectNode(null)} />
    </div>
  )
}
