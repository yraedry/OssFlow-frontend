import type { Node, Edge } from '@xyflow/react'

type FlowDefinition = {
  nodes: Array<{
    id: string
    type: 'position' | 'technique'
    data: { entityId: number; label: string }
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    data?: { condition?: string }
  }>
}

export function parseFlowDefinition(json: string | undefined): { nodes: Node[]; edges: Edge[] } {
  if (!json) return { nodes: [], edges: [] }
  try {
    const def: FlowDefinition = JSON.parse(json)
    const nodes: Node[] = def.nodes.map(n => ({
      id: n.id,
      type: n.type === 'position' ? 'positionNode' : 'techniqueNode',
      data: n.data,
      position: n.position,
    }))
    const edges: Edge[] = def.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'triggerEdge',
      data: e.data,
    }))
    return { nodes, edges }
  } catch {
    return { nodes: [], edges: [] }
  }
}

export function serializeFlowDefinition(nodes: Node[], edges: Edge[]): string {
  const def: FlowDefinition = {
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type === 'positionNode' ? 'position' : 'technique',
      data: n.data as { entityId: number; label: string },
      position: n.position,
    })),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: e.data as { condition?: string },
    })),
  }
  return JSON.stringify(def)
}
