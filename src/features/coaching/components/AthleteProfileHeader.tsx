import { Spinner } from '@/shared/components/ui/spinner'
import { useAthleteSummary } from '../hooks'
import type { AthleteSummary } from '../types'

type Props = { athleteId: number }

const MODALITY_LABELS: Record<string, string> = {
  GI:   'Kimono',
  NOGI: 'No-Gi',
  BOTH: 'Ambas',
}

function getActivityState(daysSince: number, hasInjuries: boolean) {
  if (hasInjuries) return { color: '#ef4444', label: 'LESIÓN', description: '' }
  if (daysSince <= 2) return { color: '#22c55e', label: 'AL DÍA', description: `${daysSince}d` }
  if (daysSince <= 7) return { color: '#f59e0b', label: 'ATRASADO', description: `${daysSince}d` }
  return { color: '#555', label: 'INACTIVO', description: `${daysSince}d` }
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
  ]

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', overflow: 'hidden' }}>
      {/* 3px top bar */}
      <div style={{ height: 3, background: activity.color, width: '100%' }} />

      {/* Top section: avatar + name + activity badge */}
      <div style={{ display: 'flex', gap: 20, padding: '20px 24px 16px', alignItems: 'flex-start' }}>
        {/* Avatar 56px */}
        <div style={{
          width: 56, height: 56, background: '#2563eb', color: '#fff',
          fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: `2px solid ${activity.color}`,
        }}>
          {athlete.displayName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
        </div>

        {/* Name block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: '#f0ebe3', lineHeight: 1, marginBottom: 6 }}>
            {athlete.displayName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              background: '#2563eb', color: '#fff',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px',
            }}>
              {athlete.currentBelt.toUpperCase()} · {athlete.daysInBelt}d
            </span>
            {athlete.academy && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>
                {athlete.academy}
              </span>
            )}
          </div>
        </div>

        {/* Activity badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: activity.color,
          color: activity.color === '#555' ? '#f0ebe3' : '#0f0f0f',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '6px 12px', flexShrink: 0,
        }}>
          {activity.label}{activity.description ? ` · ${activity.description}` : ''}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', borderTop: '1px solid #2a2a2a' }}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={{
            flex: 1, padding: '10px 16px',
            borderRight: i < stats.length - 1 ? '1px solid #2a2a2a' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: 2,
            }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: stat.red ? '#ef4444' : '#f0ebe3' }}>
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
      <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <Spinner />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', padding: '32px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888' }}>
        No se pudo cargar la información del atleta.
      </div>
    )
  }

  return <AthleteProfileHeaderInner athlete={summary} />
}
