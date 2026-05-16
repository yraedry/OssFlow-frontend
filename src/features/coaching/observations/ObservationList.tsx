import { Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useObservations, useDeleteObservation } from '../hooks'
import type { Observation } from '../types'

type Props = { athleteId: number }

const TONE_STYLES: Record<string, string> = {
  POSITIVE: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  NEGATIVE: 'bg-red-500/10 text-red-500 border border-red-500/20',
  NEUTRAL:  'bg-muted/30 text-muted-foreground border border-border',
}
const TONE_LABELS: Record<string, string> = {
  POSITIVE: 'Positivo', NEGATIVE: 'Negativo', NEUTRAL: 'Neutro',
}

export function ObservationList({ athleteId }: Props) {
  const { data: observations, isLoading } = useObservations(athleteId)
  const del = useDeleteObservation(athleteId)

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>
  if (!observations || observations.length === 0) {
    return (
      <div className="border border-dashed border-border/50 px-6 py-10 flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">
          Sin observaciones aún
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">
          Usa el formulario de arriba para añadir tu primera observación.
        </p>
      </div>
    )
  }

  function handleDelete(obs: Observation) {
    if (!confirm('¿Eliminar esta observación?')) return
    del.mutate(obs.id)
  }

  return (
    <div className="space-y-2">
      {observations.map(obs => (
        <div
          key={obs.id}
          className={cn('border border-border bg-card p-4 group relative', obs.id < 0 && 'opacity-60')}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm flex-1">{obs.body}</p>
            <button
              type="button"
              onClick={() => handleDelete(obs)}
              disabled={obs.id < 0 || del.isPending}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 disabled:opacity-20"
              aria-label="Borrar observación"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={cn('text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide', TONE_STYLES[obs.tone])}>
              {TONE_LABELS[obs.tone]}
            </span>
            {obs.techniqueFamily ? (
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/30 text-muted-foreground border border-border">
                {obs.techniqueFamily.replace(/_/g, ' ')}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted/10 text-muted-foreground/50 border border-dashed border-border/50">
                Sin etiquetar
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-2">
            {new Date(obs.observedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  )
}
