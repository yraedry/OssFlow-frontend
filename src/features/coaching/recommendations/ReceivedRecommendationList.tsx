import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useRecommendationsReceived, useAcceptRecommendation, useDismissRecommendation } from '../hooks'
import type { TechniqueRecommendation } from '../types'
import { Spinner } from '@/shared/components/ui/spinner'

function PendingCard({ rec, index }: { rec: TechniqueRecommendation; index: number }) {
  const accept = useAcceptRecommendation()
  const dismiss = useDismissRecommendation()
  const busy = accept.isPending || dismiss.isPending

  return (
    <div className="flex border border-border border-l-[3px]" style={{ borderLeftColor: 'var(--color-foreground)' }}>
      {/* Index */}
      <div className="w-12 shrink-0 flex items-start justify-end px-3 pt-4 border-r border-border bg-muted/10">
        <span className="font-mono text-[9px] text-muted-foreground/40">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3.5 space-y-2.5">
        <div>
          <p className="font-serif text-[15px] font-bold text-foreground leading-tight">{rec.techniqueName}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {rec.techniqueFamily && (
              <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-muted/40 text-muted-foreground border border-border">
                {rec.techniqueFamily.replace(/_/g, ' ')}
              </span>
            )}
            {rec.coachName && (
              <span className="font-mono text-[9px] text-muted-foreground/60">
                {rec.coachName}
              </span>
            )}
            <span className="font-mono text-[9px] text-muted-foreground/40">
              {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          {rec.note && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
              {rec.note}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => accept.mutate(rec.id)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-40 cursor-pointer border-none"
          >
            {accept.isPending && <Spinner />}
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => dismiss.mutate(rec.id)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors disabled:opacity-40 cursor-pointer bg-transparent"
          >
            {dismiss.isPending && <Spinner />}
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryCard({ rec }: { rec: TechniqueRecommendation }) {
  const isAccepted = rec.status === 'ACCEPTED'
  return (
    <div className="flex border border-border">
      <div className="flex-1 min-w-0 px-4 py-3 flex items-center gap-3">
        <span className="font-mono text-[12px] text-foreground/70 flex-1">{rec.techniqueName}</span>
        {rec.techniqueFamily && (
          <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 text-muted-foreground/50">
            {rec.techniqueFamily.replace(/_/g, ' ')}
          </span>
        )}
        <span className={`font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 border shrink-0 ${
          isAccepted
            ? 'border-foreground/20 text-foreground/50'
            : 'border-border text-muted-foreground/40'
        }`}>
          {isAccepted ? 'Aceptada' : 'Descartada'}
        </span>
      </div>
    </div>
  )
}

export function ReceivedRecommendationList() {
  const { data: recommendations, isLoading } = useRecommendationsReceived()
  const [historyOpen, setHistoryOpen] = useState(false)

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  const pending = recommendations?.filter(r => r.status === 'PENDING') ?? []
  const history = recommendations?.filter(r => r.status === 'ACCEPTED' || r.status === 'DISMISSED') ?? []

  if (!recommendations?.length) {
    return (
      <div className="border border-dashed border-border px-6 py-10 text-center">
        <p className="font-serif text-base text-muted-foreground/60 italic">Sin recomendaciones aún</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-2">
          Tu maestro aún no ha enviado recomendaciones
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pending.length > 0 ? (
        <div className="space-y-2">
          {pending.map((rec, i) => (
            <PendingCard key={rec.id} rec={rec} index={i} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border px-5 py-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
            Sin recomendaciones pendientes
          </p>
        </div>
      )}

      {/* History collapsible */}
      {history.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(v => !v)}
            className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
          >
            <ChevronDown
              className="h-3 w-3 transition-transform duration-150"
              style={{ transform: historyOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              strokeWidth={2}
            />
            Historial ({history.length})
          </button>
          {historyOpen && (
            <div className="space-y-1">
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
