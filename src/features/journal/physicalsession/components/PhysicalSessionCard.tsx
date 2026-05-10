import { Pencil, Trash2, Copy } from 'lucide-react'
import type { PhysicalSession } from '../types'
import { PHYSICAL_SESSION_TYPE_LABELS } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const TYPE_COLORS: Record<string, string> = {
  STRENGTH: '#f59e0b',
  CARDIO: '#10b981',
  FLEXIBILITY: '#a855f7',
  MOBILITY: '#3b82f6',
  HIIT: '#e11d48',
  OTHER: '#6b7280',
}

type Props = {
  session: PhysicalSession
  onEdit?: (session: PhysicalSession) => void
  onDuplicate?: (session: PhysicalSession) => void
  onDelete: (id: number) => void
  onDetail?: (session: PhysicalSession) => void
}

export function PhysicalSessionCard({ session, onEdit, onDuplicate, onDelete, onDetail }: Props) {
  const accent = TYPE_COLORS[session.sessionType] ?? '#6b7280'

  return (
    <div
      className="group relative flex flex-col bg-card border border-border hover:border-foreground/40 transition-colors self-start cursor-pointer"
      style={{ borderLeft: `3px solid ${accent}` }}
      onClick={() => onDetail?.(session)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(session) }}
            className="h-7 w-7 flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Editar sesión"
          >
            <Pencil className="h-3 w-3" strokeWidth={1.5} />
          </button>
        )}
        {onDuplicate && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(session) }}
            className="h-7 w-7 flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Duplicar sesión"
          >
            <Copy className="h-3 w-3" strokeWidth={1.5} />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(session.id) }}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Eliminar sesión"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-1.5 pr-20">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ ...MONO, color: accent }}>
          {PHYSICAL_SESSION_TYPE_LABELS[session.sessionType]}
        </span>
        <p className="text-sm font-semibold leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
          {session.title}
        </p>
        {session.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">{session.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 text-[10px] text-muted-foreground" style={MONO}>
        <span>{session.sessionDate}</span>
        {session.durationMinutes && <span>{session.durationMinutes} min</span>}
      </div>
    </div>
  )
}
