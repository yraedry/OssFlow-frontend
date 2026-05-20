import { Spinner } from '@/shared/components/ui/spinner'
import { useAthleteSummary } from '../hooks'
import type { AthleteSummary } from '../types'

type Props = { athleteId: number }

const MODALITY_LABELS: Record<string, string> = {
  GI:   'Kimono',
  NOGI: 'No-Gi',
  BOTH: 'Ambas',
}

const BELT_LABELS: Record<string, string> = {
  WHITE:  'Blanco',
  BLUE:   'Azul',
  PURPLE: 'Morado',
  BROWN:  'Marrón',
  BLACK:  'Negro',
}

const BELT_COLORS: Record<string, string> = {
  WHITE:  '#374151',
  BLUE:   '#2563eb',
  PURPLE: '#9333ea',
  BROWN:  '#92400e',
  BLACK:  '#111827',
}

const AGE_CATEGORY_LABELS: Record<string, string> = {
  JUVENILE: 'Juvenil',
  ADULT:    'Adulto',
  MASTER_1: 'Master 1',
  MASTER_2: 'Master 2',
  MASTER_3: 'Master 3',
  MASTER_4: 'Master 4',
}

function StripeBars({ stripes }: { stripes: number | null | undefined }) {
  const count = stripes ?? 0
  return (
    <span className="inline-flex gap-[2px] items-center ml-0.5">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="w-1 rounded-[1px]"
          style={{
            height: '11px',
            background: i < count ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)',
          }}
        />
      ))}
    </span>
  )
}

function getActivityState(daysSince: number, hasInjuries: boolean) {
  if (hasInjuries) return { color: '#ef4444', label: 'LESIÓN', description: '' }
  const recentDesc = daysSince === 0 ? 'Hoy' : daysSince === 1 ? 'Ayer' : `hace ${daysSince}d`
  if (daysSince <= 2) return { color: '#22c55e', label: 'AL DÍA', description: recentDesc }
  if (daysSince <= 7) return { color: '#f59e0b', label: 'ATRASADO', description: `hace ${daysSince}d` }
  return { color: '#555', label: 'INACTIVO', description: `hace ${daysSince}d` }
}

function formatLastSession(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return `${diffDays}d atrás`
}

function AthleteProfileHeaderInner({ athlete }: { athlete: AthleteSummary }) {
  const activity = getActivityState(athlete.daysSinceLastSession, athlete.activeInjuries.length > 0)
  const nextComp = athlete.recentCompetitions[0] ?? null
  const modalityLabel = athlete.preferredModality ? (MODALITY_LABELS[athlete.preferredModality] ?? athlete.preferredModality) : null

  const stats = [
    {
      label: 'Última sesión',
      value: formatLastSession(athlete.lastSessionDate),
      red: false,
    },
    {
      label: 'Lesiones',
      value: athlete.activeInjuries.length > 0 ? String(athlete.activeInjuries.length) : 'Ninguna',
      red: athlete.activeInjuries.length > 0,
    },
    {
      label: 'Próx. Comp.',
      value: nextComp ? nextComp.name : '—',
      red: false,
    },
    {
      label: 'Modalidad',
      value: modalityLabel ?? '—',
      red: false,
    },
    {
      label: 'Categoría',
      value: athlete.ageCategory ? (AGE_CATEGORY_LABELS[athlete.ageCategory] ?? athlete.ageCategory) : '—',
      red: false,
    },
    {
      label: 'Peso',
      value: athlete.weight != null ? `${athlete.weight} kg` : '—',
      red: false,
    },
  ]

  return (
    <div className="bg-card border border-border overflow-hidden">
      {/* 3px top bar — dynamic activity color, stays in style */}
      <div style={{ height: 3, background: activity.color, width: '100%' }} />

      {/* Top section: avatar + name + activity badge */}
      <div className="flex gap-5 px-6 pt-5 pb-4 items-start">
        {/* Avatar 56px — belt/activity border is dynamic, stays in style */}
        <div
          className="w-14 h-14 bg-blue-600 text-white font-serif text-[22px] font-bold flex items-center justify-center shrink-0"
          style={{ border: `2px solid ${activity.color}` }}
        >
          {athlete.displayName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
        </div>

        {/* Name block */}
        <div className="flex-1 min-w-0">
          <div className="font-serif text-[28px] font-bold text-foreground leading-none mb-1.5">
            {athlete.displayName}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="text-white font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 inline-flex items-center gap-1.5"
              style={{ background: BELT_COLORS[athlete.currentBelt?.toUpperCase()] ?? '#374151' }}
            >
              {BELT_LABELS[athlete.currentBelt?.toUpperCase() ?? ''] ?? athlete.currentBelt?.toUpperCase()} · {athlete.daysInBelt}d
              <StripeBars stripes={athlete.stripes} />
            </span>
            {athlete.academy && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {athlete.academy}
              </span>
            )}
          </div>
        </div>

        {/* Activity badge — color is dynamic, stays in style */}
        <div
          className="flex items-center gap-1.5 font-mono text-[11px] font-extrabold tracking-[0.08em] uppercase px-3 py-1.5 shrink-0"
          style={{
            background: activity.color,
            color: activity.color === '#555' ? '#f0f0f0' : '#0f0f0f',
          }}
        >
          {activity.label}{activity.description ? ` · ${activity.description}` : ''}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex border-t border-border">
        {stats.filter(s =>
          ['Última sesión', 'Lesiones'].includes(s.label) || s.value !== '—'
        ).map((stat, i, visibleStats) => (
          <div
            key={stat.label}
            className="flex-1 px-4 py-2.5"
            style={{ borderRight: i < visibleStats.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="font-mono text-[9px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 mb-0.5">
              {stat.label}
            </div>
            <div
              className={stat.red ? 'font-mono text-[11px] text-destructive' : 'font-mono text-[11px] text-foreground'}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AthleteProfileHeader({ athleteId }: Props) {
  const { data: summary, isLoading, isError } = useAthleteSummary(athleteId)

  if (isLoading) {
    return (
      <div className="bg-card border border-border flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="bg-card border border-border px-5 py-8 text-center font-mono text-xs text-muted-foreground">
        No se pudo cargar la información del atleta.
      </div>
    )
  }

  return <AthleteProfileHeaderInner athlete={summary} />
}
