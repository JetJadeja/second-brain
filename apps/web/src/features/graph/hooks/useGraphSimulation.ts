import { useEffect, useRef, useState, useCallback } from 'react'
import {
  forceSimulation, forceCenter, forceManyBody, forceLink, forceCollide,
} from 'd3-force'
import type { GraphNode, GraphEdge, SimNode } from '../types/graph.types'

type D3Link = { source: string; target: string; similarity: number | null }

export function useGraphSimulation(
  nodes: GraphNode[], edges: GraphEdge[], width: number, height: number,
) {
  const [simNodes, setSimNodes] = useState<SimNode[]>([])
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (nodes.length === 0 || width === 0) return

    const simData: SimNode[] = nodes.map((n) => ({
      ...n, x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0,
    }))

    const links: D3Link[] = edges.map((e) => ({
      source: e.source_id, target: e.target_id, similarity: e.similarity,
    }))

    const sim = forceSimulation<SimNode>(simData)
      .force('center', forceCenter(width / 2, height / 2))
      .force('charge', forceManyBody().strength(-120))
      .force('link', forceLink<SimNode, D3Link>(links).id((d) => d.id).distance(80))
      .force('collide', forceCollide<SimNode>().radius(20))
      .alphaDecay(0.02)

    simulationRef.current = sim

    let frameScheduled = false

    function flush() {
      frameScheduled = false
      setSimNodes([...simData])
    }

    sim.on('tick', () => {
      if (!frameScheduled && sim.alpha() >= sim.alphaMin()) {
        frameScheduled = true
        frameRef.current = requestAnimationFrame(flush)
      }
    })
    sim.on('end', flush)

    return () => {
      sim.stop()
      cancelAnimationFrame(frameRef.current)
    }
  }, [nodes, edges, width, height])

  const reheat = useCallback(() => {
    simulationRef.current?.alpha(0.3).restart()
  }, [])

  return { simNodes, reheat }
}
