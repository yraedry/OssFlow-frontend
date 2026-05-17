import { Trash2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useObservations, useDeleteObservation, useUpdateObservation } from '../hooks'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useTechniqueFamilies } from '../hooks'
import { useState } from 'react'
import type { Observation, ObservationTone } from '../types'

type Props = { athleteId: number }

const TONE_STYLES: Record<string, string> = {
  POSITIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30',
  NEGATIVE: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30',
  NEUTRAL:  'bg-muted/40 text-muted-foreground border border-border',
}
const TONE_LABELS: Record<string, string> = {
  POSITIVE: 'Positivo', NEGATIVE: 'Negativo', NEUTRAL: 'Neutro',
}
const TONE_ACTIVE: Record<string, string> = {
  POSITIVE: 'border-emerald-500 text-emerald-600',
  NEGATIVE: 'border-red-500 text-red-500',
  NEUTRAL:  'border-border text-muted-foreground',
}

function ObservationCard({ obs, athleteId }: { obs: Observation; athleteId: number }) {
  const del = useDeleteObservation(athleteId)
  const upd = useUpdateObservation(athleteId)
  const confirm = useConfirm()
  const { data: families } = useTechniqueFamilies()
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(obs.body)
  const [editTone, setEditTone] = useState<ObservationTone>(obs.tone)
  const [editFamily, setEditFamily] = useState<string>(obs.techniqueFamily ?? '')

  async function handleDelete() {
    const ok = await confirm({
      title: 'Eliminar observación',
      description: '¿Eliminar esta observación? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
    if (ok) del.mutate(obs.id)
  }

  function startEdit() {
    setEditBody(obs.body)
    setEditTone(obs.tone)
    setEditFamily(obs.techniqueFamily ?? '')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function saveEdit() {
    if (!editBody.trim()) return
    upd.mutate(
      { id: obs.id, payload: { body: editBody.trim(), tone: editTone, techniqueFamily: editFamily || null } },
      { onSuccess: () => setEditing(false) },
    )
  }

  const isPending = obs.id < 0

  if (editing) {
    return (
      <div className="border border-[#f97316]/40 bg-card p-4 space-y-3">
        <textarea
          value={editBody}
          onChange={e => setEditBody(e.target.value)}
          rows={3}
          autoFocus
          className="w-full bg-transparent text-sm resize-none outline-none font-mono border-b border-border/50 pb-2 focus:border-[#f97316]/50 transition-colors"
          disabled={upd.isPending}
        />
        <div className="flex flex-wrap gap-2">
          {(['POSITIVE', 'NEUTRAL', 'NEGATIVE'] as ObservationTone[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setEditTone(t)}
              className={cn(
                'px-2.5 py-1 text-[10px] border font-mono uppercase tracking-wide transition-colors cursor-pointer',
                editTone === t ? TONE_ACTIVE[t] : 'text-muted-foreground border-border hover:border-muted-foreground',
              )}
            >
              {TONE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={editFamily}
            onChange={e => setEditFamily(e.target.value)}
            className="flex-1 bg-transparent text-[10px] border border-border px-2 py-1.5 text-muted-foreground font-mono outline-none"
            disabled={upd.isPending}
          >
            <option value="">Sin familia</option>
            {families?.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button
            type="button"
            onClick={saveEdit}
            disabled={!editBody.trim() || upd.isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-foreground text-background text-[10px] font-mono uppercase tracking-wide disabled:opacity-40 cursor-pointer"
          >
            {upd.isPending ? <Spinner /> : <Check className="h-3 w-3" strokeWidth={2.5} />}
            Guardar
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={upd.isPending}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('border border-border bg-card p-4 group', isPending && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm flex-1 leading-relaxed">{obs.body}</p>
        <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={startEdit}
            disabled={isPending}
            className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors disabled:opacity-20 cursor-pointer"
            aria-label="Editar observación"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending || del.isPending}
            className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-20 cursor-pointer"
            aria-label="Eliminar observación"
          >
            {del.isPending ? <Spinner /> : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        <span className={cn('text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide', TONE_STYLES[obs.tone])}>
          {TONE_LABELS[obs.tone]}
        </span>
        {obs.techniqueFamily ? (
          <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
            {obs.techniqueFamily.replace(/_/g, ' ')}
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide text-muted-foreground/40 border border-dashed border-border/40">
            Sin etiquetar
          </span>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">
        {new Date(obs.observedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </div>
  )
}

export function ObservationList({ athleteId }: Props) {
  const { data: observations, isLoading } = useObservations(athleteId)

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  if (!observations || observations.length === 0) {
    return (
      <div className="border border-dashed border-border/50 px-6 py-10 flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">
          Sin observaciones aún
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono">
          Usa el formulario de arriba para añadir tu primera observación.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {observations.map(obs => (
        <ObservationCard key={obs.id} obs={obs} athleteId={athleteId} />
      ))}
    </div>
  )
}
