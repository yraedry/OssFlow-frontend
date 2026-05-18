import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { ReceivedNoteList } from '@/features/coaching/notes/ReceivedNoteList'
import { ReceivedRecommendationList } from '@/features/coaching/recommendations/ReceivedRecommendationList'
import { ReceivedStudyPlanList } from '@/features/coaching/studyplan/ReceivedStudyPlanList'
import { ReceivedPrivateSessionList } from '@/features/coaching/privatesession/ReceivedPrivateSessionList'
import { useNoteUnreadCount, useRecommendationsReceived } from '@/features/coaching/hooks'

type Tab = 'notas' | 'planificacion' | 'clases' | 'tecnicas'

export function MaestroPage() {
  const [tab, setTab] = useState<Tab>('notas')
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Área del atleta
            </p>
            <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight leading-none">
              Coaching
            </h1>
          </div>

          <div className="flex items-center gap-3 mb-0.5">
            {/* Unread / pending pills */}
            {count > 0 && (
              <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide border border-foreground px-2.5 py-1 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground inline-block" />
                {count} {count === 1 ? 'nota nueva' : 'notas nuevas'}
              </span>
            )}
            {pendingRecs > 0 && (
              <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide border border-border px-2.5 py-1 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
                {pendingRecs} recom.
              </span>
            )}
            {/* Link to Configuración */}
            <Link
              to="/configuracion#mis-maestros"
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide bg-foreground text-background hover:bg-foreground/85 transition-colors px-4 py-2 border border-foreground"
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
              Gestionar maestros
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {([
            { id: 'notas' as Tab, label: 'Notas', badge: count },
            { id: 'planificacion' as Tab, label: 'Planificación', badge: 0 },
            { id: 'clases' as Tab, label: 'Clases', badge: 0 },
            { id: 'tecnicas' as Tab, label: 'Técnicas', badge: pendingRecs },
          ]).map(({ id, label, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative px-4 py-2.5 font-mono text-xs uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                tab === id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {badge > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1 font-mono text-[9px] font-bold bg-foreground text-background">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 py-6">
        {tab === 'notas' && <NotasTab />}
        {tab === 'planificacion' && <PlanificacionTab />}
        {tab === 'clases' && <ClasesTab />}
        {tab === 'tecnicas' && <TecnicasTab />}
      </div>
    </div>
  )
}

// ─── Notas tab ────────────────────────────────────────────────────────────────

function NotasTab() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
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
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Planes de estudio
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <ReceivedStudyPlanList />
    </div>
  )
}

// ─── Clases tab ───────────────────────────────────────────────────────────────

function ClasesTab() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Clases privadas
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <ReceivedPrivateSessionList />
    </div>
  )
}

// ─── Técnicas tab ─────────────────────────────────────────────────────────────

function TecnicasTab() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Técnicas recomendadas
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <ReceivedRecommendationList />
    </div>
  )
}
