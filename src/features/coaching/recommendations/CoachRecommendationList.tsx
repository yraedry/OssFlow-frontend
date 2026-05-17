import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useRecommendationsSent, useCancelRecommendation } from '../hooks'
import type { TechniqueRecommendation, RecommendationStatus } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'
import { useConfirm } from '@/shared/hooks/useConfirm'

interface Props {
  athleteId: number
}

function StatusChip({ status }: { status: RecommendationStatus }) {
  if (status === 'ACCEPTED') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-green-500/10 text-green-600 border border-green-500/30">
        Aceptada
      </span>
    )
  }
  if (status === 'DISMISSED') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
        Descartada
      </span>
    )
  }
  return null
}

function ActiveCard({ rec, athleteId }: { rec: TechniqueRecommendation; athleteId: number }) {
  const cancel = useCancelRecommendation(athleteId)
  const confirm = useConfirm()

  async function handleCancel() {
    const ok = await confirm({
      title: 'Cancelar recomendación',
      description: '¿Cancelar esta recomendación? El atleta ya no podrá aceptarla.',
      confirmLabel: 'Cancelar recomendación',
      cancelLabel: 'Mantener',
      variant: 'destructive',
    })
    if (ok) cancel.mutate(rec.id)
  }

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono">{rec.techniqueName}</p>
          {rec.techniqueFamily && (
            <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
              {rec.techniqueFamily.replace(/_/g, ' ')}
            </span>
          )}
          {rec.note && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">{rec.note}</p>
          )}
          <p className="mt-2 text-[10px] text-muted-foreground/60 font-mono">
            {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancel.isPending}
          className="shrink-0 text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50 hover:text-destructive border border-border/40 hover:border-destructive/40 px-2 py-1 transition-colors disabled:opacity-20 cursor-pointer"
        >
          {cancel.isPending ? <Spinner /> : 'Cancelar'}
        </button>
      </div>
    </div>
  )
}

function HistoryCard({ rec }: { rec: TechniqueRecommendation }) {
  return (
    <div className={`border border-border bg-card p-4 ${rec.status === 'CANCELLED' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-mono ${rec.status === 'CANCELLED' ? 'line-through text-muted-foreground' : ''}`}>
            {rec.techniqueName}
          </p>
          {rec.techniqueFamily && (
            <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
              {rec.techniqueFamily.replace(/_/g, ' ')}
            </span>
          )}
          {rec.note && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">{rec.note}</p>
          )}
          <p className="mt-2 text-[10px] text-muted-foreground font-mono">
            {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {rec.status !== 'CANCELLED' && <StatusChip status={rec.status} />}
        {rec.status === 'CANCELLED' && (
          <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50 border border-dashed border-border/30 px-2 py-0.5">
            Cancelada
          </span>
        )}
      </div>
    </div>
  )
}

export function CoachRecommendationList({ athleteId }: Props) {
  const { data: recommendations, isLoading } = useRecommendationsSent(athleteId)
  const [historyOpen, setHistoryOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  const active = recommendations?.filter(r => r.status === 'PENDING') ?? []
  const history = recommendations?.filter(r => r.status !== 'PENDING') ?? []

  if (!recommendations?.length) {
    return (
      <div className="border border-dashed border-border/50 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground font-mono">Aún no has enviado recomendaciones.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active */}
      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Activas</p>
          {active.map(rec => (
            <ActiveCard key={rec.id} rec={rec} athleteId={athleteId} />
          ))}
        </div>
      )}

      {active.length === 0 && (
        <div className="border border-dashed border-border/50 px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground font-mono">Sin recomendaciones activas.</p>
        </div>
      )}

      {/* History (collapsible) */}
      {history.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(prev => !prev)}
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ transform: historyOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              strokeWidth={2}
            />
            Historial ({history.length})
          </button>
          {historyOpen && (
            <div className="space-y-2">
              {history.map(rec => (
                <HistoryCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
