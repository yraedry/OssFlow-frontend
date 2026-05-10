import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, MoveRight, Play } from 'lucide-react'
import type { Technique } from '../types'

const CATEGORY_ACCENT: Record<Technique['category'], string> = {
  SUBMISSION: '#e11d48',
  SWEEP:      '#f59e0b',
  PASS:       '#3b82f6',
  TAKEDOWN:   '#f97316',
  ESCAPE:     '#10b981',
  TRANSITION: '#a855f7',
}

const CATEGORY_LABELS: Record<Technique['category'], string> = {
  SUBMISSION: 'Sumisión',
  SWEEP:      'Barrida',
  PASS:       'Pasada',
  TAKEDOWN:   'Derribo',
  ESCAPE:     'Escape',
  TRANSITION: 'Transición',
}

const BELT_LABELS: Record<Technique['minimumBelt'], string> = {
  WHITE:  'Blanco',
  BLUE:   'Azul',
  PURPLE: 'Morado',
  BROWN:  'Marrón',
  BLACK:  'Negro',
}

type TechniqueCardProps = {
  technique: Technique
  onEdit: (technique: Technique) => void
  onDelete: (id: number) => void
}

export function TechniqueCard({ technique: t, onEdit, onDelete }: TechniqueCardProps) {
  const navigate = useNavigate()
  const accent = CATEGORY_ACCENT[t.category]

  return (
    <div
      className="group relative flex flex-col bg-card border border-border cursor-pointer hover:border-foreground/40 transition-colors"
      style={{ borderLeft: `3px solid ${accent}` }}
      onClick={() => navigate(`/estudio/tecnicas/${t.id}`)}
    >
      {/* Acciones — solo visibles en hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          aria-label="Editar técnica"
          onClick={(e) => { e.stopPropagation(); onEdit(t) }}
          className="h-7 w-7 flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Eliminar técnica"
          onClick={(e) => { e.stopPropagation(); onDelete(t.id) }}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Categoría label */}
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', color: accent }}
        >
          {CATEGORY_LABELS[t.category]}
        </span>

        {/* Nombre */}
        <p className="text-sm font-semibold leading-snug pr-16">{t.name}</p>

        {/* Posición inicio → fin */}
        {t.startPositionName && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <span>{t.startPositionName}</span>
            {t.endPositionName && (
              <>
                <MoveRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                <span>{t.endPositionName}</span>
              </>
            )}
          </div>
        )}

        {/* Descripción */}
        {t.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          {BELT_LABELS[t.minimumBelt]}
        </span>
        {t.youtubeUrl && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <Play className="h-2.5 w-2.5" strokeWidth={1.5} />
            VIDEO
          </span>
        )}
      </div>
    </div>
  )
}
