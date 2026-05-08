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
import { toast } from 'sonner'

// nodeTypes must be defined outside the component to avoid re-render issues
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

  // ------------------------------------------------------------------
  // Callbacks passed into node data
  // ------------------------------------------------------------------
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes(nds => nds.filter(n => n.id !== id))
      // Also remove edges connected to this node
      setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
    },
    [setNodes, setEdges],
  )

  const handleLabelChange = useCallback(
    (id: string, label: string) => {
      setNodes(nds =>
        nds.map(n =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n,
        ),
      )
    },
    [setNodes],
  )

  // edgeTypes defined with useMemo but the callback references are stable
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
          data: {
            entityId,
            label,
            onDelete: handleDeleteNode,
            onLabelChange: handleLabelChange,
          },
        },
      ])
    },
    [reactFlowInstance, setNodes, handleDeleteNode, handleLabelChange],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // ------------------------------------------------------------------
  // Save
  // ------------------------------------------------------------------
  const handleSave = useCallback(() => {
    updateSystem({
      id: systemId,
      data: { flowDefinition: serializeFlowDefinition(nodes, edges) },
    })
  }, [systemId, nodes, edges, updateSystem])

  // ------------------------------------------------------------------
  // Export / Import
  // ------------------------------------------------------------------
  const handleExport = useCallback(() => {
    const json = serializeFlowDefinition(nodes, edges)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sistema-${system?.name ?? systemId}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Workflow exportado correctamente.')
  }, [nodes, edges, system?.name, systemId])

  const handleImport = useCallback(
    (jsonString: string) => {
      try {
        const { nodes: importedNodes, edges: importedEdges } = parseFlowDefinition(jsonString)
        // Inject callbacks into imported nodes
        const nodesWithCallbacks = importedNodes.map(n => ({
          ...n,
          data: {
            ...n.data,
            onDelete: handleDeleteNode,
            onLabelChange: handleLabelChange,
          },
        }))
        setNodes(nodesWithCallbacks)
        setEdges(importedEdges)
        toast.success('Workflow importado correctamente.')
      } catch {
        toast.error('Error al importar: el archivo no es válido.')
      }
    },
    [setNodes, setEdges, handleDeleteNode, handleLabelChange],
  )

  // ------------------------------------------------------------------
  // Edge condition
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Inject callbacks into nodes for render (already present on freshly-dropped
  // nodes; this covers nodes loaded from persisted flowDefinition)
  const nodesWithCallbacks = nodes.map(n => ({
    ...n,
    data: {
      ...n.data,
      onDelete: handleDeleteNode,
      onLabelChange: handleLabelChange,
    },
  }))

  return (
    <div className="flex flex-col h-full">
      <FlowEditorToolbar
        systemName={system?.name ?? ''}
        onSave={handleSave}
        isSaving={isSaving}
        nodes={nodes}
        edges={edges}
        onExport={handleExport}
        onImport={handleImport}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 shrink-0 border-r bg-background overflow-y-auto">
          <NodePalette />
        </aside>
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            deleteKeyCode="Delete"
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
