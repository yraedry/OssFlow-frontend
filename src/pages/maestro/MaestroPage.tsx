import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { ReceivedNoteList } from '@/features/coaching/notes/ReceivedNoteList'
import { ReceivedRecommendationList } from '@/features/coaching/recommendations/ReceivedRecommendationList'
import { ReceivedStudyPlanList } from '@/features/coaching/studyplan/ReceivedStudyPlanList'
import { ReceivedPrivateSessionList } from '@/features/coaching/privatesession/ReceivedPrivateSessionList'
import { useNoteUnreadCount, useRecommendationsReceived, useReceivedNotes, useMarkNoteRead } from '@/features/coaching/hooks'

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
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Área del atleta
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Coaching
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Gestionar maestros</span>
          </Link>
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
  const { data: notes } = useReceivedNotes()
  const markRead = useMarkNoteRead()

  // Al montar el tab, marcar todas las notas no leídas como leídas
  useEffect(() => {
    if (!notes) return
    notes.filter(n => !n.read).forEach(n => markRead.mutate(n.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes?.length])

  return (
    <div className="space-y-4">
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
    <div className="space-y-4">
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
    <div className="space-y-4">
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
