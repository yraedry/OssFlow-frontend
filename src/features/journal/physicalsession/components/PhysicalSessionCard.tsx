import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { PhysicalSession } from '../types'
import { PHYSICAL_SESSION_TYPE_LABELS } from '../types'

type Props = {
  session: PhysicalSession
  onDelete: (id: number) => void
}

export function PhysicalSessionCard({ session, onDelete }: Props) {
  return (
    <div className="border border-border p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="border border-muted-foreground px-1.5 py-0.5 text-muted-foreground"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            {PHYSICAL_SESSION_TYPE_LABELS[session.sessionType]}
          </span>
          <span
            className="text-sm font-medium text-foreground"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {session.title}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(session.id)}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Eliminar sesión"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
        <span>{session.sessionDate}</span>
        {session.durationMinutes && <span>{session.durationMinutes} min</span>}
      </div>
      {session.youtubeUrl && (
        <a
          href={session.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Ver en YouTube →
        </a>
      )}
      {session.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{session.notes}</p>
      )}
    </div>
  )
}
