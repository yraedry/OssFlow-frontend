import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Eye, BarChart2, MessageSquare, BookOpen, Trophy } from 'lucide-react'
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
import { cn } from '@/shared/lib/utils'

type Tab = 'observaciones' | 'radar' | 'notas' | 'recomendaciones' | 'competiciones'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'observaciones',   label: 'Observaciones', icon: <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'radar',           label: 'Análisis',      icon: <BarChart2 className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'notas',           label: 'Notas',         icon: <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'recomendaciones', label: 'Técnicas',      icon: <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} /> },
  { id: 'competiciones',   label: 'Compet.',       icon: <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} /> },
]

export function AthleteProfilePage() {
  const { athleteId } = useParams<{ athleteId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('observaciones')

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

      {/* Tab bar */}
      <div className="flex border border-border overflow-hidden">
        {TABS.map(t => (
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
      <div className="border border-border bg-card p-4">
        {tab === 'observaciones' && (
          <>
            <ObservationForm athleteId={id} />
            <ObservationList athleteId={id} />
          </>
        )}
        {tab === 'radar' && <CoachRadarTab athleteId={id} />}
        {tab === 'notas' && (
          <>
            <CoachNoteForm athleteId={id} />
            <CoachNoteList athleteId={id} />
          </>
        )}
        {tab === 'recomendaciones' && (
          <>
            <RecommendationForm athleteId={id} />
            <CoachRecommendationList athleteId={id} />
          </>
        )}
        {tab === 'competiciones' && <CoachCompetitionTab athleteId={id} />}
      </div>
    </div>
  )
}
