import { Handle, Position, type NodeProps } from '@xyflow/react'

type PositionNodeData = { entityId: number; label: string }

export function PositionNode({ data }: NodeProps) {
  const nodeData = data as unknown as PositionNodeData
  return (
    <div className="rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 p-3 min-w-[120px] text-center shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
        Posición
      </div>
      <div className="text-sm font-semibold">{nodeData.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
