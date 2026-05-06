import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useSystem, useUpdateSystem } from '@/features/catalog/system/hooks'
import { parseFlowDefinition, serializeFlowDefinition } from '@/features/catalog/system/lib/flowMapper'
import { PositionNode } from './PositionNode'
import { TechniqueNode } from './TechniqueNode'
import { TriggerEdge } from './TriggerEdge'
import { NodePalette } from './NodePalette'
import { FlowEditorToolbar } from './FlowEditorToolbar'
import { EdgeConditionDialog } from './EdgeConditionDialog'
import { Spinner } from '@/shared/components/ui/spinner'

const nodeTypes: NodeTypes = {
  positionNode: PositionNode,
  techniqueNode: TechniqueNode,
}

function FlowCanvas({ systemId }: { systemId: number }) {
  const { data: system, isLoading } = useSystem(systemId)
  const { mutate: updateSystem, isPending: isSaving } = useUpdateSystem()
  const reactFlowInstance = useReactFlow()

  const initialFlow = useMemo(
    () => parseFlowDefinition(system?.flowDefinition),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [system?.id],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      triggerEdge: (props) => (
        <TriggerEdge
          {...props}
          data={{ ...(props.data as object), onLabelClick: setSelectedEdgeId }}
        />
      ),
    }),
    [],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds =>
        addEdge({ ...connection, type: 'triggerEdge', data: {} }, eds),
      )
    },
    [setEdges],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const raw = event.dataTransfer.getData('application/ossflow-node')
      if (!raw) return
      const { type, entityId, label } = JSON.parse(raw) as {
        type: 'position' | 'technique'
        entityId: number
        label: string
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      setNodes(nds => [
        ...nds,
        {
          id: `${type}-${entityId}-${Date.now()}`,
          type: type === 'position' ? 'positionNode' : 'techniqueNode',
          position,
          data: { entityId, label },
        },
      ])
    },
    [reactFlowInstance, setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleSave = useCallback(() => {
    updateSystem({
      id: systemId,
      data: { flowDefinition: serializeFlowDefinition(nodes, edges) },
    })
  }, [systemId, nodes, edges, updateSystem])

  const selectedEdge = edges.find(e => e.id === selectedEdgeId)
  const initialCondition = (selectedEdge?.data as { condition?: string } | undefined)?.condition ?? ''

  const handleConditionSave = useCallback(
    (edgeId: string, condition: string) => {
      setEdges(eds =>
        eds.map(e =>
          e.id === edgeId ? { ...e, data: { ...(e.data as object), condition } } : e,
        ),
      )
    },
    [setEdges],
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <FlowEditorToolbar
        systemName={system?.name ?? ''}
        onSave={handleSave}
        isSaving={isSaving}
        nodes={nodes}
        edges={edges}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 shrink-0 border-r bg-background overflow-y-auto">
          <NodePalette />
        </aside>
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
      <EdgeConditionDialog
        edgeId={selectedEdgeId}
        initialCondition={initialCondition}
        onSave={handleConditionSave}
        onClose={() => setSelectedEdgeId(null)}
      />
    </div>
  )
}

export function SystemEditorPage() {
  const { id } = useParams<{ id: string }>()
  const systemId = Number(id)

  if (!systemId) {
    return <div className="p-8 text-center text-muted-foreground">ID de sistema inválido</div>
  }

  return (
    <ReactFlowProvider>
      <div className="h-full">
        <FlowCanvas systemId={systemId} />
      </div>
    </ReactFlowProvider>
  )
}
