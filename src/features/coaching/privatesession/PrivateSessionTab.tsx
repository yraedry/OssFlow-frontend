import { useState } from 'react'
import { usePrivateSessions, useDeletePrivateSession } from './hooks'
import { PrivateSessionForm } from './PrivateSessionForm'
import type { PrivateSession } from './types'
import { Spinner } from '@/shared/components/ui/spinner'

type Props = { athleteId: number }

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({
  session,
  onConfirm,
  onCancel,
}: {
  session: PrivateSession
  onConfirm: () => void
  onCancel: () => void
}) {
  const label = session.title || new Date(session.sessionDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border w-full max-w-sm p-6 space-y-4">
        <div>
          <p className="font-serif text-base font-bold text-foreground">¿Borrar sesión?</p>
          <p className="font-mono text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Se eliminará «{label}» de forma permanente.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session Row ──────────────────────────────────────────────────────────────

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

  return (
    <div className="border border-border">
      <div className="flex items-stretch">
        {/* Clickable main area */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex-1 text-left flex items-start gap-0 hover:bg-muted/30 transition-colors bg-transparent border-none p-0 cursor-pointer min-w-0"
        >
          {/* Date column */}
          <div className="w-28 shrink-0 flex flex-col items-end px-3 pt-3.5 pb-3 border-r border-border bg-muted/10">
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {new Date(session.sessionDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
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
            {session.techniquesWorked?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {session.techniquesWorked.map(t => (
                  <span key={t} className="font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 bg-muted/30 text-muted-foreground/70 border border-border/50">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </button>

        {/* Action buttons — always visible */}
        <div className="flex shrink-0 border-l border-border">
          <button
            type="button"
            onClick={onEdit}
            title="Editar"
            className="w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer border-r border-border"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H2v-3L11.5 2.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Borrar"
            className="w-10 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-r border-border"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" />
            </svg>
          </button>
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="w-8 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <span
              className="font-mono text-[11px] transition-transform inline-block"
              style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
            >
              →
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3 bg-muted/5">
          {session.notes ? (
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{session.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin notas</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function PrivateSessionTab({ athleteId }: Props) {
  const { data: sessions, isLoading } = usePrivateSessions(athleteId)
  const deleteMutation = useDeletePrivateSession(athleteId)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<PrivateSession | null>(null)
  const [deletingSession, setDeletingSession] = useState<PrivateSession | null>(null)

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
              onDelete={() => setDeletingSession(s)}
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
      {deletingSession && (
        <DeleteConfirmModal
          session={deletingSession}
          onConfirm={() => {
            deleteMutation.mutate(deletingSession.id)
            setDeletingSession(null)
          }}
          onCancel={() => setDeletingSession(null)}
        />
      )}
    </div>
  )
}
