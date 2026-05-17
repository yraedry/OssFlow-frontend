import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Eye, BarChart2, Trophy, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { AthleteProfileHeader } from '@/features/coaching/components/AthleteProfileHeader'
import { ObservationForm } from '@/features/coaching/observations/ObservationForm'
import { ObservationList } from '@/features/coaching/observations/ObservationList'
import { CoachRadarTab } from '@/features/coaching/observations/CoachRadarTab'
import { CoachNoteForm } from '@/features/coaching/notes/CoachNoteForm'
import { CoachNoteList } from '@/features/coaching/notes/CoachNoteList'
import { RecommendationForm } from '@/features/coaching/recommendations/RecommendationForm'
import { CoachRecommendationList } from '@/features/coaching/recommendations/CoachRecommendationList'
import { CoachCompetitionTab } from '@/features/coaching/competition/CoachCompetitionTab'
import { CoachStudyPlanTab } from '@/features/coaching/studyplan/CoachStudyPlanTab'
import { cn } from '@/shared/lib/utils'

type MainTab = 'observaciones' | 'analisis' | 'planificacion' | 'competiciones'
type PlanSubTab = 'planes' | 'tecnicas' | 'notas'

const MAIN_TABS: { id: MainTab; label: string; icon: React.ReactNode }[] = [
  { id: 'observaciones', label: 'Observaciones', icon: <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'analisis',      label: 'Análisis',      icon: <BarChart2 className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'planificacion', label: 'Planificación', icon: <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'competiciones', label: 'Compet.',       icon: <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} /> },
]

export function AthleteProfilePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<MainTab>('observaciones')
  const [planSubTab, setPlanSubTab] = useState<PlanSubTab>('planes')

  if (!athleteId) return null
  const id = Number(athleteId)

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/gimnasio')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wide cursor-pointer"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver al gimnasio
      </button>

      {/* Athlete header */}
      <AthleteProfileHeader athleteId={id} />

      {/* Main tab bar */}
      <div className="flex border border-border overflow-hidden">
        {MAIN_TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] font-mono uppercase tracking-wide transition-colors border-r border-border last:border-r-0 cursor-pointer',
              tab === t.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]',
            )}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="border border-border bg-card">
        {tab === 'planificacion' && (
          <div
            style={{
              borderBottom: '1px solid #2a2a2a',
              display: 'flex',
              padding: '0 24px',
            }}
          >
            {(['planes', 'tecnicas', 'notas'] as PlanSubTab[]).map(st => (
              <button
                key={st}
                onClick={() => setPlanSubTab(st)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: planSubTab === st ? '#f0ebe3' : '#555',
                  borderBottom: planSubTab === st ? '2px solid #f0ebe3' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {st === 'planes' ? 'Planes' : st === 'tecnicas' ? 'Técnicas' : 'Notas'}
              </button>
            ))}
          </div>
        )}

        <div className="p-4">
          {tab === 'observaciones' && (
            <>
              <ObservationForm athleteId={id} />
              <ObservationList athleteId={id} />
            </>
          )}
          {tab === 'analisis' && <CoachRadarTab athleteId={id} />}
          {tab === 'planificacion' && planSubTab === 'planes' && <CoachStudyPlanTab athleteId={id} />}
          {tab === 'planificacion' && planSubTab === 'tecnicas' && (
            <>
              <RecommendationForm athleteId={id} />
              <CoachRecommendationList athleteId={id} />
            </>
          )}
          {tab === 'planificacion' && planSubTab === 'notas' && (
            <>
              <CoachNoteForm athleteId={id} />
              <CoachNoteList athleteId={id} />
            </>
          )}
          {tab === 'competiciones' && <CoachCompetitionTab athleteId={id} />}
        </div>
      </div>
    </div>
  )
}
