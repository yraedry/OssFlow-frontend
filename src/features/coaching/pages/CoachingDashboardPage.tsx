import { useNavigate } from 'react-router-dom'
import { Users, Key } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Coaching
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Mi gimnasio
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AthletesCount />
          <Link
            to="/configuracion#invitation"
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
          >
            <Key className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Código de invitación</span>
          </Link>
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
    </div>
  )
}
