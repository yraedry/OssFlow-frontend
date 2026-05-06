import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
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
}: EdgeProps) {
  const edgeData = (data ?? {}) as TriggerEdgeData
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: edgeData.condition ? '#6366f1' : '#94a3b8' }} />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute pointer-events-all cursor-pointer"
          onClick={() => edgeData.onLabelClick?.(id)}
        >
          {edgeData.condition ? (
            <span className="rounded bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-300 shadow-sm">
              {edgeData.condition.length > 20
                ? edgeData.condition.slice(0, 20) + '…'
                : edgeData.condition}
            </span>
          ) : (
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400 border border-dashed border-slate-300">
              + condición
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
