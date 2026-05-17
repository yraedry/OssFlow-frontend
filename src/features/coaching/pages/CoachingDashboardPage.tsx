import { useNavigate, Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { AthleteRoster } from '../components/AthleteRoster'
import { useAthletes } from '../hooks'

const MONO = { fontFamily: 'var(--font-mono)' } as const

function AthletesCount() {
  const { data: athletes } = useAthletes()
  const count = athletes?.length ?? 0
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      style={MONO}
    >
      <Users className="h-3 w-3" strokeWidth={1.5} />
      {count} alumno{count !== 1 ? 's' : ''}
    </span>
  )
}

export function CoachingDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="border-b border-border/40 pb-5">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1"
          style={MONO}
        >
          Panel de coaching
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1
            className="text-3xl font-black leading-none text-foreground"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Mi gimnasio
          </h1>
          <AthletesCount />
        </div>
      </div>

      {/* Athletes section */}
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
            style={MONO}
          >
            Alumnos vinculados
          </p>
        </header>
        <AthleteRoster onSelectAthlete={(id) => navigate(`/gimnasio/atletas/${id}`)} />
      </section>

      {/* Hint */}
      <p className="text-xs text-muted-foreground/50 text-center" style={MONO}>
        Genera un código de invitación en{' '}
        <Link
          to="/configuracion#invitation"
          className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          Configuración
        </Link>{' '}
        para añadir alumnos.
      </p>
    </div>
  )
}
