import { useState, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

type TechniqueNodeData = {
  entityId: number
  label: string
  onDelete?: (id: string) => void
  onLabelChange?: (id: string, label: string) => void
}

export function TechniqueNode({ id, data }: NodeProps) {
  const nodeData = data as TechniqueNodeData
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
    <div className="relative rounded border-2 border-border bg-muted p-3 min-w-[120px] text-center shadow-sm">
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

      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
        Técnica
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-sm font-semibold w-full text-center bg-transparent border-b border-purple-400 outline-none"
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
