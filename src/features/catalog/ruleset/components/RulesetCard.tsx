import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { Ruleset } from '../types'

type RulesetCardProps = {
  ruleset: Ruleset
  onEdit: (ruleset: Ruleset) => void
  onDelete: (id: number) => void
}

export function RulesetCard({ ruleset, onEdit, onDelete }: RulesetCardProps) {
  return (
    <div className="group relative flex flex-col bg-card border border-border hover:border-foreground/40 transition-colors">
      {/* Acciones */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          aria-label="Editar reglamento"
          onClick={() => onEdit(ruleset)}
          className="h-7 w-7 flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Eliminar reglamento"
          onClick={() => onDelete(ruleset.id)}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          Federación
        </span>
        <p className="text-sm font-semibold leading-snug pr-16">
          {ruleset.federationName ?? `Federación #${ruleset.federationId}`}
        </p>
      </div>

      {ruleset.sourceUrl && (
        <div className="flex items-center px-4 py-2 border-t border-border/50">
          <a
            href={ruleset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.5} />
            VER REGLAMENTO
          </a>
        </div>
      )}
    </div>
  )
}
