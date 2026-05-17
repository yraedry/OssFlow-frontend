import { AlertTriangle, Trophy, Shirt, Users } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAthleteSummary } from '../hooks'

type Props = { athleteId: number }

const BELT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  white:  { bg: 'bg-[#e8e4dc]', text: 'text-[#1a1a1a]', label: 'BLANCO' },
  blue:   { bg: 'bg-[#2563eb]', text: 'text-white',      label: 'AZUL' },
  purple: { bg: 'bg-[#7c3aed]', text: 'text-white',      label: 'PÚRPURA' },
  brown:  { bg: 'bg-[#92400e]', text: 'text-white',      label: 'MARRÓN' },
  black:  { bg: 'bg-[#0f0f0f] border border-[#555]', text: 'text-[#f0ebe3]', label: 'NEGRO' },
}

function getBelt(belt: string) {
  const norm = belt.toLowerCase()
  for (const [key, val] of Object.entries(BELT_STYLES)) {
    if (norm.includes(key)) return val
  }
  return { bg: 'bg-muted', text: 'text-foreground', label: belt.toUpperCase() }
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

const AGE_LABELS: Record<string, string> = {
  JUVENILE: 'Juvenil',
  ADULT:    'Adulto',
  MASTER_1: 'Master 1',
  MASTER_2: 'Master 2',
  MASTER_3: 'Master 3',
  MASTER_4: 'Master 4',
}

const MODALITY_LABELS: Record<string, string> = {
  GI:   'Kimono',
  NOGI: 'No-Gi',
  BOTH: 'Ambas',
}

const MONO = { fontFamily: 'var(--font-mono)' }

export function AthleteProfileHeader({ athleteId }: Props) {
  const { data: summary, isLoading, isError } = useAthleteSummary(athleteId)

  if (isLoading) {
    return (
      <div className="border border-border bg-card flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="border border-border bg-card px-5 py-8 text-sm text-muted-foreground text-center" style={MONO}>
        No se pudo cargar la información del atleta.
      </div>
    )
  }

  const belt = getBelt(summary.currentBelt)

  return (
    <div className="border border-border bg-card overflow-hidden">
      {/* Top stripe — belt color */}
      <div className={cn('h-1 w-full', belt.bg)} />

      {/* Identity block */}
      <div className="px-5 pt-4 pb-4 border-b border-border/40">
        <div className="flex items-start gap-4">
          {/* Belt badge as avatar */}
          <div className={cn('h-12 w-12 shrink-0 flex items-center justify-center text-lg font-black', belt.bg, belt.text)}
            style={{ fontFamily: 'var(--font-serif)' }}>
            {summary.displayName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-black leading-tight text-foreground truncate"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {summary.displayName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {summary.academy && (
                <span className="text-xs text-muted-foreground" style={MONO}>{summary.academy}</span>
              )}
              {summary.ageCategory && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                  <Users className="h-3 w-3" strokeWidth={1.5} />
                  {AGE_LABELS[summary.ageCategory] ?? summary.ageCategory}
                </span>
              )}
              {summary.preferredModality && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                  <Shirt className="h-3 w-3" strokeWidth={1.5} />
                  {MODALITY_LABELS[summary.preferredModality] ?? summary.preferredModality}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Belt + days */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={cn('px-2 py-0.5 text-[10px] font-bold', belt.bg, belt.text)} style={MONO}>
            {belt.label}
          </span>
          <span className="text-xs text-muted-foreground" style={MONO}>
            {summary.daysInBelt}d en cinturón
          </span>
          <ActivityBadge days={summary.daysSinceLastSession} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/40">
        <div className="px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>
            Actividad
          </p>
          {summary.lastSessionDate ? (
            <p className="text-xs text-foreground" style={MONO}>
              {new Date(summary.lastSessionDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50" style={MONO}>Sin sesiones</p>
          )}
        </div>
        <div className="px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>
            Lesiones
          </p>
          <p className="text-xs text-foreground" style={MONO}>
            {summary.activeInjuries.length > 0
              ? <span className="text-red-500">{summary.activeInjuries.length} activa{summary.activeInjuries.length !== 1 ? 's' : ''}</span>
              : 'Ninguna'}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>
            Competiciones
          </p>
          <p className="text-xs text-foreground" style={MONO}>
            {summary.recentCompetitions.length > 0
              ? `${summary.recentCompetitions.length} reciente${summary.recentCompetitions.length !== 1 ? 's' : ''}`
              : 'Ninguna'}
          </p>
        </div>
      </div>

      {/* Injuries detail */}
      {summary.activeInjuries.length > 0 && (
        <div className="px-5 py-3 border-b border-border/40">
          <p
            className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1"
            style={MONO}
          >
            <AlertTriangle className="h-3 w-3" strokeWidth={2} />
            Lesiones activas
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {summary.activeInjuries.map((injury, i) => (
              <li key={`${injury.bodyPart}-${i}`} className="flex items-center gap-1.5 text-xs" style={MONO}>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-medium">{injury.bodyPart}</span>
                <span className="text-muted-foreground capitalize">— {injury.severity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitions detail */}
      {summary.recentCompetitions.length > 0 && (
        <div className="px-5 py-3">
          <p
            className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1"
            style={MONO}
          >
            <Trophy className="h-3 w-3" strokeWidth={2} />
            Últimas competiciones
          </p>
          <ul className="space-y-2">
            {summary.recentCompetitions.map(comp => (
              <li key={`${comp.name}-${comp.date}`} className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold truncate">{comp.name}</p>
                <p className="text-xs text-muted-foreground shrink-0" style={MONO}>
                  {new Date(comp.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
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
