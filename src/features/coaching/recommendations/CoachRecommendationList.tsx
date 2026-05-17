import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
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

function RecommendationDetailModal({ rec, athleteId, onClose }: {
  rec: TechniqueRecommendation
  athleteId: number
  onClose: () => void
}) {
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
    if (ok) { cancel.mutate(rec.id); onClose() }
  }

  const statusColor = rec.status === 'ACCEPTED' ? '#22c55e'
    : rec.status === 'DISMISSED' ? 'var(--border)'
    : rec.status === 'CANCELLED' ? 'var(--border)'
    : '#f97316'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background shadow-xl flex flex-col"
        style={{ borderLeft: `3px solid ${statusColor}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-orange-500">Recomendación de técnica</p>
            <p className="text-xs text-muted-foreground/60 font-mono">
              {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Técnica</p>
            <p className="text-sm font-medium text-foreground">{rec.techniqueName}</p>
          </div>

          {rec.techniqueFamily && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Familia técnica</p>
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted text-muted-foreground border border-border">
                {rec.techniqueFamily.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {rec.note && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Nota</p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{rec.note}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Estado</p>
            {rec.status === 'PENDING' ? (
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-orange-500/10 text-orange-600 border border-orange-500/30">
                Pendiente
              </span>
            ) : rec.status === 'CANCELLED' ? (
              <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide bg-muted text-muted-foreground/50 border border-dashed border-border/40">
                Cancelada
              </span>
            ) : (
              <StatusChip status={rec.status} />
            )}
          </div>
        </div>

        {/* Actions */}
        {rec.status === 'PENDING' && (
          <div className="flex gap-2 px-6 pb-5 border-t border-border pt-4">
            <button
              onClick={handleCancel}
              disabled={cancel.isPending}
              className="border border-destructive/40 text-destructive text-xs font-mono uppercase py-2 px-4 hover:bg-destructive/10 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {cancel.isPending ? <Spinner /> : 'Cancelar recomendación'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ActiveCard({ rec, athleteId }: { rec: TechniqueRecommendation; athleteId: number }) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
      <div
        className="border border-border bg-card p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        style={{ borderLeft: '3px solid #f97316' }}
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono line-clamp-1">{rec.techniqueName}</p>
            {rec.techniqueFamily && (
              <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
                {rec.techniqueFamily.replace(/_/g, ' ')}
              </span>
            )}
            {rec.note && (
              <p className="mt-1.5 text-xs text-muted-foreground font-mono line-clamp-1">{rec.note}</p>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
            {new Date(rec.recommendedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {detailOpen && (
        <RecommendationDetailModal
          rec={rec}
          athleteId={athleteId}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  )
}

function HistoryCard({ rec, athleteId }: { rec: TechniqueRecommendation; athleteId: number }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const borderColor = rec.status === 'ACCEPTED' ? '#22c55e'
    : rec.status === 'DISMISSED' ? 'var(--border)'
    : 'var(--border)'

  return (
    <>
      <div
        className={`border border-border bg-card p-3 cursor-pointer hover:bg-muted/30 transition-colors ${rec.status === 'CANCELLED' ? 'opacity-50' : ''}`}
        style={{ borderLeft: `3px solid ${borderColor}` }}
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-mono line-clamp-1 ${rec.status === 'CANCELLED' ? 'line-through text-muted-foreground' : ''}`}>
              {rec.techniqueName}
            </p>
            {rec.techniqueFamily && (
              <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wide bg-muted/40 text-muted-foreground border border-border">
                {rec.techniqueFamily.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            {rec.status !== 'CANCELLED' ? (
              <StatusChip status={rec.status} />
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground/50 border border-dashed border-border/30 px-2 py-0.5">
                Cancelada
              </span>
            )}
          </div>
        </div>
      </div>

      {detailOpen && (
        <RecommendationDetailModal
          rec={rec}
          athleteId={athleteId}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {active.map(rec => (
              <ActiveCard key={rec.id} rec={rec} athleteId={athleteId} />
            ))}
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {history.map(rec => (
                <HistoryCard key={rec.id} rec={rec} athleteId={athleteId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
