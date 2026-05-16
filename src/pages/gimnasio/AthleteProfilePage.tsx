import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { AthleteProfileHeader } from '@/features/coaching/components/AthleteProfileHeader'
import { ObservationForm } from '@/features/coaching/observations/ObservationForm'
import { ObservationList } from '@/features/coaching/observations/ObservationList'
import { CoachRadarTab } from '@/features/coaching/observations/CoachRadarTab'

type Tab = 'observaciones' | 'radar'

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
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wide"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver al gimnasio
      </button>

      {/* Athlete header */}
      <AthleteProfileHeader athleteId={id} />

      {/* Tabs */}
      <div className="border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border">
          {(['observaciones', 'radar'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wide transition-colors border-b-2 ${
                tab === t
                  ? 'font-semibold border-[#f97316] text-[#f97316]'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t === 'observaciones' ? 'Observaciones' : 'Radar'}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'observaciones' ? (
            <>
              <ObservationForm athleteId={id} />
              <ObservationList athleteId={id} />
            </>
          ) : (
            <CoachRadarTab athleteId={id} />
          )}
        </div>
      </div>
    </div>
  )
}
