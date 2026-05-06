import { useNavigate } from 'react-router-dom'
import type { Node, Edge } from '@xyflow/react'
import { toast } from 'sonner'

type FlowEditorToolbarProps = {
  systemName: string
  onSave: () => void
  isSaving: boolean
  nodes: Node[]
  edges: Edge[]
}

export function FlowEditorToolbar({
  systemName,
  onSave,
  isSaving,
  nodes,
  edges,
}: FlowEditorToolbarProps) {
  const navigate = useNavigate()

  const handleValidate = () => {
    const connectedNodeIds = new Set<string>()
    edges.forEach(e => {
      connectedNodeIds.add(e.source)
      connectedNodeIds.add(e.target)
    })
    const isolated = nodes.filter(n => !connectedNodeIds.has(n.id))
    if (isolated.length > 0) {
      toast.warning(
        `${isolated.length} nodo(s) sin conexiones: ${isolated.map(n => (n.data as { label?: string }).label ?? n.id).join(', ')}`,
      )
    } else if (nodes.length === 0) {
      toast.info('El canvas está vacío. Añade nodos desde la paleta.')
    } else {
      toast.success('El grafo es válido. Todos los nodos están conectados.')
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent transition-colors"
      >
        ← Volver
      </button>

      <span className="flex-1 text-sm font-medium truncate">{systemName}</span>

      <button
        type="button"
        onClick={handleValidate}
        className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent transition-colors"
      >
        Validar
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isSaving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  )
}
