import { useState } from 'react'
import { MyCoachesSection } from '@/features/coaching/components/MyCoachesSection'
import { ReceivedNoteList } from '@/features/coaching/notes/ReceivedNoteList'
import { ReceivedRecommendationList } from '@/features/coaching/recommendations/ReceivedRecommendationList'
import { ReceivedStudyPlanList } from '@/features/coaching/studyplan/ReceivedStudyPlanList'
import { useNoteUnreadCount, useRecommendationsReceived } from '@/features/coaching/hooks'

type Tab = 'maestros' | 'notas' | 'planificacion'

export function MaestroPage() {
  const [tab, setTab] = useState<Tab>('maestros')
  const { data: unreadCount } = useNoteUnreadCount()
  const count = unreadCount ?? 0
  const { data: receivedRecommendations } = useRecommendationsReceived()
  const pendingRecs = receivedRecommendations?.filter(r => r.status === 'PENDING').length ?? 0

  return (
    <div className="min-h-[60vh] flex flex-col">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border pb-5 mb-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Área del atleta
            </p>
            <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight leading-none">
              Maestro
            </h1>
          </div>
          {/* Unread summary pill */}
          {(count > 0 || pendingRecs > 0) && (
            <div className="flex items-center gap-2 mb-0.5">
              {count > 0 && (
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide border border-foreground px-2.5 py-1 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground inline-block" />
                  {count} {count === 1 ? 'nota nueva' : 'notas nuevas'}
                </span>
              )}
              {pendingRecs > 0 && (
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide border border-border px-2.5 py-1 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
                  {pendingRecs} {pendingRecs === 1 ? 'recomendación' : 'recomendaciones'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-border">
        {([
          { id: 'maestros' as Tab, label: 'Mis maestros', badge: 0 },
          { id: 'notas' as Tab, label: 'Notas', badge: count },
          { id: 'planificacion' as Tab, label: 'Planificación', badge: pendingRecs },
        ]).map(({ id, label, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors border-r border-border last:border-r-0 flex items-center gap-2 cursor-pointer ${
              tab === id
                ? 'bg-foreground text-background'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            {label}
            {badge > 0 && (
              <span className={`inline-flex items-center justify-center h-4 min-w-[1rem] px-1 font-mono text-[9px] font-bold rounded-sm ${
                tab === id
                  ? 'bg-background text-foreground'
                  : 'bg-foreground text-background'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 py-6">
        {tab === 'maestros' && <MaestrosTab />}
        {tab === 'notas' && <NotasTab />}
        {tab === 'planificacion' && <PlanificacionTab />}
      </div>
    </div>
  )
}

// ─── Maestros tab ─────────────────────────────────────────────────────────────

function MaestrosTab() {
  return (
    <div className="max-w-2xl space-y-8">

      {/* Section label */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Vincular maestro
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <MyCoachesSection />
    </div>
  )
}

// ─── Notas tab ────────────────────────────────────────────────────────────────

function NotasTab() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Notas de tu maestro
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <ReceivedNoteList />
    </div>
  )
}

// ─── Planificación tab ────────────────────────────────────────────────────────

function PlanificacionTab() {
  return (
    <div className="space-y-8">

      {/* Study plans */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Planes de estudio
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <ReceivedStudyPlanList />
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Técnicas recomendadas
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <ReceivedRecommendationList />
      </div>

    </div>
  )
}
