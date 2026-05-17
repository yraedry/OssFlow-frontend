import { useState } from 'react'
import { useCreatePrivateSession, useUpdatePrivateSession } from './hooks'
import type { PrivateSession, CreatePrivateSessionPayload, UpdatePrivateSessionPayload } from './types'

type Mode =
  | { kind: 'create'; athleteId: number }
  | { kind: 'edit'; session: PrivateSession }

type Props = {
  mode: Mode
  onClose: () => void
}

export function PrivateSessionForm({ mode, onClose }: Props) {
  const athleteId = mode.kind === 'create' ? mode.athleteId : mode.session.athleteId

  const initial = mode.kind === 'edit' ? mode.session : null
  const [sessionDate, setSessionDate] = useState(initial?.sessionDate ?? new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState(initial?.startTime?.slice(0, 5) ?? '')
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes?.toString() ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const create = useCreatePrivateSession(athleteId)
  const update = useUpdatePrivateSession(athleteId)
  const isPending = create.isPending || update.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const common = {
      sessionDate,
      startTime: startTime || null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      title: title || null,
      notes: notes || null,
    }

    if (mode.kind === 'create') {
      const payload: CreatePrivateSessionPayload = { athleteId, ...common }
      create.mutate(payload, { onSuccess: onClose })
    } else {
      const payload: UpdatePrivateSessionPayload = common
      update.mutate({ id: mode.session.id, payload }, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">
            {mode.kind === 'create' ? 'Registrar sesión' : 'Editar sesión'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Hora (opcional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="flex-1">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="60"
                className="w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Título (opcional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Single leg X — entrada desde guard"
              className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Notas (opcional)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Qué se trabajó, puntos a mejorar..."
              className="w-full border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
