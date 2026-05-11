import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'

type TriggerEdgeData = {
  condition?: string
  onLabelClick?: (edgeId: string) => void
}

export function TriggerEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = (data ?? {}) as TriggerEdgeData
  const { setEdges } = useReactFlow()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEdges(eds => eds.filter(edge => edge.id !== id))
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: edgeData.condition ? '#6366f1' : '#94a3b8',
          strokeWidth: selected ? 2.5 : 1.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute pointer-events-all flex items-center gap-1"
        >
          {/* Condition label / add button */}
          <span
            className="cursor-pointer"
            onClick={() => edgeData.onLabelClick?.(id)}
          >
            {edgeData.condition ? (
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground border border-border shadow-sm">
                {edgeData.condition.length > 20
                  ? edgeData.condition.slice(0, 20) + '…'
                  : edgeData.condition}
              </span>
            ) : (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground border border-dashed border-border">
                + condición
              </span>
            )}
          </span>

          {/* Delete button — visible when edge is selected */}
          {selected && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center leading-none hover:opacity-80 transition-opacity shadow"
              title="Eliminar arista"
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
