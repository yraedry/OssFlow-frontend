import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useRecommendationsReceived, useAcceptRecommendation, useDismissRecommendation } from '../hooks'
import type { TechniqueRecommendation } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'

function PendingCard({ rec }: { rec: TechniqueRecommendation }) {
  const accept = useAcceptRecommendation()
  const dismiss = useDismissRecommendation()
  const busy = accept.isPending || dismiss.isPending

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono">{rec.techniqueName}</p>
          {rec.techniqueFamily && (
            <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
              {rec.techniqueFamily.replace(/_/g, ' ')}
            </span>
          )}
          {rec.coachName && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              De: {rec.coachName}
            </p>
          )}
          {rec.note && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">{rec.note}</p>
          )}
          <p className="mt-2 text-[10px] text-muted-foreground font-mono">
            {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => accept.mutate(rec.id)}
          disabled={busy}
          className="px-3 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-1.5"
        >
          {accept.isPending && <Spinner />}
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => dismiss.mutate(rec.id)}
          disabled={busy}
          className="px-3 py-1.5 text-xs border border-border text-muted-foreground font-mono uppercase tracking-wide disabled:opacity-40 hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          {dismiss.isPending && <Spinner />}
          Descartar
        </button>
      </div>
    </div>
  )
}

function HistoryCard({ rec }: { rec: TechniqueRecommendation }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono">{rec.techniqueName}</p>
          {rec.techniqueFamily && (
            <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
              {rec.techniqueFamily.replace(/_/g, ' ')}
            </span>
          )}
          {rec.coachName && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              De: {rec.coachName}
            </p>
          )}
          <p className="mt-2 text-[10px] text-muted-foreground font-mono">
            {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {rec.status === 'ACCEPTED' && (
          <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-green-500/10 text-green-600 border border-green-500/30 shrink-0">
            Aceptada
          </span>
        )}
        {rec.status === 'DISMISSED' && (
          <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border shrink-0">
            Descartada
          </span>
        )}
      </div>
    </div>
  )
}

export function ReceivedRecommendationList() {
  const { data: recommendations, isLoading } = useRecommendationsReceived()
  const [historyOpen, setHistoryOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  const pending = recommendations?.filter(r => r.status === 'PENDING') ?? []
  const history = recommendations?.filter(r => r.status === 'ACCEPTED' || r.status === 'DISMISSED') ?? []

  if (!recommendations?.length) {
    return (
      <div className="border border-dashed border-border/50 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground font-mono">Tu maestro aún no ha enviado recomendaciones.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Pendientes</p>
          {pending.map(rec => (
            <PendingCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      {pending.length === 0 && (
        <div className="border border-dashed border-border/50 px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground font-mono">Sin recomendaciones pendientes.</p>
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
