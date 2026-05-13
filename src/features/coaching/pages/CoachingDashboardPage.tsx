import { useState } from 'react'
import { InvitationCard } from '../components/InvitationCard'
import { AthleteRoster } from '../components/AthleteRoster'
import { AthleteSummaryDrawer } from '../components/AthleteSummaryDrawer'

export function CoachingDashboardPage() {
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black" style={{ fontFamily: 'var(--font-serif)' }}>
          Mi gimnasio
        </h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
          Panel de coaching
        </p>
      </div>

      {/* Invitation section */}
      <section className="space-y-3">
        <h2
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Código de invitación
        </h2>
        <InvitationCard />
      </section>

      {/* Athletes section */}
      <section className="space-y-3">
        <h2
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Mis alumnos
        </h2>
        <AthleteRoster onSelectAthlete={(id) => setSelectedAthleteId(id)} />
      </section>

      <AthleteSummaryDrawer
        athleteId={selectedAthleteId}
        onClose={() => setSelectedAthleteId(null)}
      />
    </div>
  )
}
