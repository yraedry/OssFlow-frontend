import { useState } from 'react'
import { usePrivateSessions, useDeletePrivateSession } from './hooks'
import { PrivateSessionForm } from './PrivateSessionForm'
import type { PrivateSession } from './types'
import { Spinner } from '@/shared/components/ui/spinner'

type Props = { athleteId: number }

function SessionRow({
  session,
  onEdit,
  onDelete,
}: {
  session: PrivateSession
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="border border-border">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left flex items-start gap-0 hover:bg-muted/30 transition-colors bg-transparent border-none p-0 cursor-pointer"
      >
        {/* Date column */}
        <div className="w-28 shrink-0 flex flex-col items-end px-3 pt-3.5 pb-3 border-r border-border bg-muted/10">
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {new Date(session.sessionDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </span>
          {session.startTime && (
            <span className="font-mono text-[9px] text-muted-foreground/50">
              {session.startTime.slice(0, 5)}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {session.title ? (
              <p className="text-sm text-foreground leading-snug">{session.title}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin título</p>
            )}
            {session.durationMinutes && (
              <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-muted/40 text-muted-foreground border border-border">
                {session.durationMinutes} min
              </span>
            )}
          </div>
        </div>

        {/* Expand arrow */}
        <div className="w-8 shrink-0 flex items-center justify-center border-l border-border self-stretch">
          <span
            className="font-mono text-[11px] text-muted-foreground/30 transition-transform"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          >
            →
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/5">
          {session.notes ? (
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{session.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin notas</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border border-border px-2.5 py-1 cursor-pointer"
            >
              Editar
            </button>
            {confirming ? (
              <span className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-muted-foreground">¿Borrar?</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="font-mono text-[9px] uppercase tracking-widest text-red-500 hover:text-red-400 border border-red-500/50 px-2 py-1 cursor-pointer"
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
                  className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border px-2 py-1 cursor-pointer"
                >
                  No
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
                className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              >
                Borrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function PrivateSessionTab({ athleteId }: Props) {
  const { data: sessions, isLoading } = usePrivateSessions(athleteId)
  const deleteMutation = useDeletePrivateSession(athleteId)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<PrivateSession | null>(null)

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Sesiones privadas
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="font-mono text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 transition-colors px-3 py-1.5 cursor-pointer"
        >
          + Registrar sesión
        </button>
      </div>

      {!sessions?.length ? (
        <div className="border border-dashed border-border px-6 py-10 text-center">
          <p className="font-serif text-base text-muted-foreground/60 italic">Sin sesiones aún</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-2">
            Registra la primera sesión privada con este atleta
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <SessionRow
              key={s.id}
              session={s}
              onEdit={() => setEditing(s)}
              onDelete={() => deleteMutation.mutate(s.id)}
            />
          ))}
        </div>
      )}

      {creating && (
        <PrivateSessionForm
          mode={{ kind: 'create', athleteId }}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <PrivateSessionForm
          mode={{ kind: 'edit', session: editing }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
