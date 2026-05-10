import { Pencil, Trash2, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Position } from '../types'

const TYPE_ACCENT: Record<Position['type'], string> = {
  TOP:            '#f97316',
  BOTTOM:         '#3b82f6',
  STANDING:       '#10b981',
  GROUND_NEUTRAL: '#a855f7',
  SUBMITTED:      '#e11d48',
}

const TYPE_LABELS: Record<Position['type'], string> = {
  TOP:            'Dominante',
  BOTTOM:         'Inferior',
  STANDING:       'De pie',
  GROUND_NEUTRAL: 'Neutral suelo',
  SUBMITTED:      'Sumisión',
}

interface PositionCardProps {
  position: Position
  onEdit: (position: Position) => void
  onDelete: (id: number) => void
}

export function PositionCard({ position, onEdit, onDelete }: PositionCardProps) {
  const navigate = useNavigate()
  const accent = TYPE_ACCENT[position.type]

  return (
    <div
      className="group relative flex flex-col bg-card border border-border cursor-pointer hover:border-foreground/40 transition-colors"
      style={{ borderLeft: `3px solid ${accent}` }}
      onClick={() => navigate(`/estudio/posiciones/${position.id}`)}
    >
      {/* Acciones — solo en hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          aria-label="Editar posición"
          onClick={(e) => { e.stopPropagation(); onEdit(position) }}
          className="h-7 w-7 flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Eliminar posición"
          onClick={(e) => { e.stopPropagation(); onDelete(position.id) }}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Tipo label */}
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', color: accent }}
        >
          {TYPE_LABELS[position.type]}
        </span>

        {/* Nombre */}
        <p className="text-sm font-semibold leading-snug pr-16">{position.name}</p>

        {/* Descripción */}
        {position.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{position.description}</p>
        )}
      </div>

      {/* Footer */}
      {position.youtubeUrl && (
        <div className="flex items-center justify-end px-4 py-2 border-t border-border/50">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <Play className="h-2.5 w-2.5" strokeWidth={1.5} />
            VIDEO
          </span>
        </div>
      )}
    </div>
  )
}
