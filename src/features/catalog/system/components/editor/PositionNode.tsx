import { useState, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

type PositionNodeData = {
  entityId: number
  label: string
  onDelete?: (id: string) => void
  onLabelChange?: (id: string, label: string) => void
}

export function PositionNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as PositionNodeData
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(nodeData.label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commitEdit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== nodeData.label) {
      nodeData.onLabelChange?.(id, trimmed)
    } else {
      setDraft(nodeData.label)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') {
      setDraft(nodeData.label)
      setEditing(false)
    }
  }

  return (
    <div className="relative rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 p-3 min-w-[120px] text-center shadow-sm">
      <Handle type="target" position={Position.Top} />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => nodeData.onDelete?.(id)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center leading-none hover:opacity-80 transition-opacity shadow"
        title="Eliminar nodo"
      >
        ×
      </button>

      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
        Posición
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-sm font-semibold w-full text-center bg-transparent border-b border-blue-400 outline-none"
        />
      ) : (
        <div
          className="text-sm font-semibold cursor-text"
          onDoubleClick={() => {
            setDraft(nodeData.label)
            setEditing(true)
          }}
          title="Doble click para editar"
        >
          {nodeData.label}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
