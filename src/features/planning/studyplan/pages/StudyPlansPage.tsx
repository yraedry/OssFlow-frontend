import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useReceivedStudyPlans } from '@/features/coaching/studyplan/hooks'
import { ReceivedPlanViewer } from '@/features/coaching/studyplan/ReceivedPlanViewer'
import type { StudyPlan } from '@/features/coaching/studyplan/types'
import { BookOpen, FileText } from 'lucide-react'

export function StudyPlansPage() {
  const [viewingPlanId, setViewingPlanId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    try {
      return (localStorage.getItem('studyplan-view') as 'cards' | 'table') ?? 'cards'
    } catch {
      return 'cards'
    }
  })

  const { data: plans, isLoading } = useReceivedStudyPlans()

  function toggleView() {
    const next = viewMode === 'cards' ? 'table' : 'cards'
    setViewMode(next)
    try { localStorage.setItem('studyplan-view', next) } catch { /* ignore */ }
  }

  if (viewingPlanId) {
    return (
      <ReceivedPlanViewer
        planId={viewingPlanId}
        onBack={() => setViewingPlanId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Planes de estudio
        </p>
        <button
          type="button"
          onClick={toggleView}
          className="font-mono text-[10px] uppercase tracking-[0.06em] border border-border px-3 py-1.5 bg-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {viewMode === 'cards' ? '≡ Tabla' : '⊞ Tarjetas'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : !plans?.length ? (
        <div className="border border-dashed border-border p-12 flex flex-col items-center gap-3 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Tu maestro aún no ha creado planes de estudio
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {['Título', 'Estado', 'Fecha', 'Bloques', ''].map(h => (
                <th
                  key={h}
                  className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground/60 px-4 py-1.5 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <ReceivedTableRow
                key={plan.id}
                plan={plan}
                onView={() => setViewingPlanId(plan.id)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-border">
          {plans.map(plan => (
            <ReceivedPlanCard
              key={plan.id}
              plan={plan}
              onView={() => setViewingPlanId(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ReceivedTableRow ────────────────────────────────────────────────────────

function ReceivedTableRow({ plan, onView }: { plan: StudyPlan; onView: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      onClick={onView}
      className={cn('border-b border-border cursor-pointer transition-colors', hovered ? 'bg-muted/50' : 'bg-transparent')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="font-sans text-[13px] text-foreground px-4 py-2.5 font-medium">{plan.title}</td>
      <td className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-4 py-2.5">
        <span className={plan.status === 'PUBLISHED' ? 'text-emerald-500' : 'text-muted-foreground/60'}>
          {plan.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
        </span>
      </td>
      <td className="font-mono text-[11px] text-muted-foreground px-4 py-2.5">
        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
      </td>
      <td className="font-mono text-[11px] text-muted-foreground px-4 py-2.5">
        {(plan.blocks ?? []).length}
      </td>
      <td className="px-4 py-2.5 text-right">
        <span className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-wide">Ver →</span>
      </td>
    </tr>
  )
}

// ─── ReceivedPlanCard ─────────────────────────────────────────────────────────

function ReceivedPlanCard({ plan, onView }: { plan: StudyPlan; onView: () => void }) {
  const isPublished = plan.status === 'PUBLISHED'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onView() }}
      className={cn('relative p-4 cursor-pointer transition-colors', hovered ? 'bg-muted/50' : 'bg-card')}
      style={{ borderLeft: `3px solid ${isPublished ? '#22c55e' : 'var(--border)'}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card top: title + status badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="font-serif text-[15px] font-bold text-foreground leading-tight flex-1">
          {plan.title}
        </div>
        <span
          className="font-mono text-[8px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 shrink-0 border"
          style={{
            color: isPublished ? '#22c55e' : undefined,
            borderColor: isPublished ? '#22c55e44' : 'var(--border)',
          }}
        >
          <span className={isPublished ? '' : 'text-muted-foreground/60'}>
            {isPublished ? 'PUBLICADO' : 'BORRADOR'}
          </span>
        </span>
      </div>

      {/* Block previews */}
      <div className="flex flex-col gap-0.5 mb-2.5">
        {(plan.blocks ?? []).slice(0, 3).map(b => (
          <div key={b.id} className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-border shrink-0 inline-block" />
            {b.title || 'Bloque sin título'}
          </div>
        ))}
        {(plan.blocks ?? []).length > 3 && (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/40">
            <span className="w-1 h-1 rounded-full bg-border/60 shrink-0 inline-block" />
            +{(plan.blocks ?? []).length - 3} más
          </div>
        )}
        {(plan.blocks ?? []).length === 0 && (
          <div className="font-mono text-[10px] text-muted-foreground/60 italic">Sin bloques</div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-mono text-[10px] text-muted-foreground/60">
          {plan.createdAt
            ? new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <FileText className="w-3 h-3 text-muted-foreground/40" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}
