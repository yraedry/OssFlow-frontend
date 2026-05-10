import { Link } from 'react-router-dom'
import { Pencil, Trash2, GitBranch, ArrowRight } from 'lucide-react'
import type { System } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }

type SystemCardProps = {
  system: System
  onEdit: (system: System) => void
  onDelete: (id: number) => void
}

export function SystemCard({ system, onEdit, onDelete }: SystemCardProps) {
  return (
    <div className="group border border-border bg-card hover:border-foreground transition-colors">
      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <h3 className="font-bold truncate" style={{ ...SERIF, fontSize: '15px' }}>{system.name}</h3>
          </div>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(system)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Editar sistema"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(system.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Eliminar sistema"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Description */}
        {system.description && (
          <p className="text-xs text-muted-foreground line-clamp-2" style={MONO}>
            {system.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-1 border-t border-border">
          <Link
            to={`/estudio/sistemas/${system.id}/edit`}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide hover:text-foreground text-muted-foreground transition-colors"
            style={MONO}
            onClick={(e) => e.stopPropagation()}
          >
            Abrir flow
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}
