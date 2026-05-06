import { Handle, Position, type NodeProps } from '@xyflow/react'

type TechniqueNodeData = { entityId: number; label: string }

export function TechniqueNode({ data }: NodeProps) {
  const nodeData = data as unknown as TechniqueNodeData
  return (
    <div className="rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-950 p-3 min-w-[120px] text-center shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
        Técnica
      </div>
      <div className="text-sm font-semibold">{nodeData.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
