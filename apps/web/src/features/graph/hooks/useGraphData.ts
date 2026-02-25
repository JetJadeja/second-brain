import { useState, useEffect } from 'react'
import { graphService } from '../services/graph.service'
import type { GraphNode, GraphEdge } from '../types/graph.types'

type UseGraphDataReturn = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  isLoading: boolean
  error: string | null
}

export function useGraphData(): UseGraphDataReturn {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    graphService
      .getGraphData()
      .then((data) => {
        setNodes(data.nodes)
        setEdges(data.edges)
      })
      .catch(() => setError('Failed to load graph data'))
      .finally(() => setIsLoading(false))
  }, [])

  return { nodes, edges, isLoading, error }
}
