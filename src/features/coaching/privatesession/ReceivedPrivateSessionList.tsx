import { useState } from 'react'
import { usePrivateSessionsMine } from './hooks'
import type { PrivateSession } from './types'
import { Spinner } from '@/shared/components/ui/spinner'

function SessionCard({ session, index }: { session: PrivateSession; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setExpanded(v => !v)}
      className="w-full text-left group transition-colors hover:bg-muted/30 cursor-pointer bg-transparent border-none p-0"
    >
      <div className="flex border border-border">
        {/* Index column */}
        <div className="w-12 shrink-0 flex items-start justify-end px-3 pt-4 border-r border-border bg-muted/10">
          <span className="font-mono text-[9px] text-muted-foreground/40">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3.5">
          <div className="flex items-start justify-between gap-3 mb-2">
            {session.title ? (
              <p className="text-sm leading-snug text-foreground/80">{session.title}</p>
            ) : (
              <p className="text-sm leading-snug text-muted-foreground italic">Sesión sin título</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {new Date(session.sessionDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            {session.durationMinutes && (
              <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-muted/40 text-muted-foreground border border-border">
                {session.durationMinutes} min
              </span>
            )}
          </div>
          {session.techniquesWorked?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {session.techniquesWorked.map(t => (
                <span key={t} className="font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 bg-muted/30 text-muted-foreground/70 border border-border/50">
                  {t}
                </span>
              ))}
            </div>
          )}
          {expanded && session.notes && (
            <p className="mt-3 text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed border-t border-border pt-3">
              {session.notes}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="w-8 shrink-0 flex items-center justify-center border-l border-border">
          <span
            className="font-mono text-[11px] text-muted-foreground/30 group-hover:text-foreground transition-all"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          >
            →
          </span>
        </div>
      </div>
    </button>
  )
}

export function ReceivedPrivateSessionList() {
  const { data: sessions, isLoading } = usePrivateSessionsMine()

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  if (!sessions?.length) {
    return (
      <div className="border border-dashed border-border px-6 py-10 text-center">
        <p className="font-serif text-base text-muted-foreground/60 italic">Sin clases aún</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-2">
          Tu maestro aún no ha registrado sesiones privadas contigo
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((s, i) => (
        <SessionCard key={s.id} session={s} index={i} />
      ))}
    </div>
  )
}
