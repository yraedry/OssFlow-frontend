import { AlertTriangle, Trophy } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAthleteSummary } from '../hooks'

type Props = { athleteId: number }

const BELT_STYLES: Record<string, string> = {
  white:  'bg-[#e8e4dc] text-[#1a1a1a]',
  blue:   'bg-[#2563eb] text-white',
  purple: 'bg-[#7c3aed] text-white',
  brown:  'bg-[#92400e] text-white',
  black:  'bg-[#0f0f0f] text-[#f0ebe3] border border-[#555]',
}

function getBeltStyle(belt: string): string {
  const norm = belt.toLowerCase()
  for (const [key, val] of Object.entries(BELT_STYLES)) {
    if (norm.includes(key)) return val
  }
  return 'bg-muted text-foreground'
}

function beltLabel(belt: string): string {
  const map: Record<string, string> = {
    white: 'BLANCO', blue: 'AZUL', purple: 'PÚRPURA', brown: 'MARRÓN', black: 'NEGRO',
  }
  const norm = belt.toLowerCase()
  for (const [key, label] of Object.entries(map)) {
    if (norm.includes(key)) return label
  }
  return belt.toUpperCase()
}

function ActivityBadge({ days }: { days: number }) {
  const [color, label] =
    days <= 3 ? ['bg-emerald-500', 'Al día'] :
    days <= 7 ? ['bg-amber-500',   'Inactivo'] :
                ['bg-red-500',     'Sin entrenar']
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider', color)}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
      {label} · {days}d
    </span>
  )
}

const LABEL = 'text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'
const MONO  = { fontFamily: 'var(--font-mono)' }

export function AthleteProfileHeader({ athleteId }: Props) {
  const { data: summary, isLoading, isError } = useAthleteSummary(athleteId)

  if (isLoading) {
    return (
      <div className="border border-border bg-card flex items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="border border-border bg-card px-5 py-10 text-sm text-muted-foreground text-center" style={MONO}>
        No se pudo cargar la información del atleta.
      </div>
    )
  }

  return (
    <div className="border border-border bg-card overflow-hidden">
      {/* Identity block */}
      <div className="px-5 py-5 border-b border-border/40">
        <h2
          className="text-xl font-black leading-tight"
          style={{ fontFamily: 'var(--font-serif)', color: '#f0ebe3' }}
        >
          {summary.displayName}
        </h2>
        {summary.academy && (
          <p className="text-xs text-muted-foreground mt-1" style={MONO}>{summary.academy}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span
            className={cn('px-2 py-0.5 text-[10px] font-bold', getBeltStyle(summary.currentBelt))}
            style={MONO}
          >
            {beltLabel(summary.currentBelt)}
          </span>
          <span className="text-xs text-muted-foreground" style={MONO}>
            {summary.daysInBelt}d en cinturón
          </span>
        </div>
      </div>

      {/* Activity */}
      <div className="px-5 py-4 border-b border-border/40">
        <p className={LABEL} style={MONO}>Actividad</p>
        <ActivityBadge days={summary.daysSinceLastSession} />
        {summary.lastSessionDate && (
          <p className="text-xs text-muted-foreground mt-2" style={MONO}>
            Última sesión: {new Date(summary.lastSessionDate).toLocaleDateString('es-ES')}
          </p>
        )}
      </div>

      {/* Injuries */}
      {summary.activeInjuries.length > 0 && (
        <div className="px-5 py-4 border-b border-border/40">
          <p className={cn(LABEL, 'text-red-400')} style={MONO}>
            <AlertTriangle className="inline h-3 w-3 mr-1" strokeWidth={2} />
            Lesiones activas
          </p>
          <ul className="space-y-1.5">
            {summary.activeInjuries.map((injury, i) => (
              <li key={i} className="flex items-center gap-2 text-xs" style={MONO}>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-medium">{injury.bodyPart}</span>
                <span className="text-muted-foreground capitalize">— {injury.severity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitions */}
      {summary.recentCompetitions.length > 0 && (
        <div className="px-5 py-4">
          <p className={LABEL} style={MONO}>
            <Trophy className="inline h-3 w-3 mr-1" strokeWidth={2} />
            Últimas competiciones
          </p>
          <ul className="space-y-3">
            {summary.recentCompetitions.map((comp, i) => (
              <li key={i}>
                <p className="text-sm font-semibold">{comp.name}</p>
                <p className="text-xs text-muted-foreground" style={MONO}>
                  {new Date(comp.date).toLocaleDateString('es-ES')}
                  {comp.result && ` · ${comp.result}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
