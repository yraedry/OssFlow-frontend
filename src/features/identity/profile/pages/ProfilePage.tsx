import { useState, useEffect } from 'react'
import { Pencil, Building2, Calendar, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useProfile } from '../hooks'
import { useFederations } from '@/features/identity/federation/hooks'
import { InjurySection } from '@/features/identity/injury/InjurySection'
import { getAvatarFromStorage } from '@/shared/hooks/useAvatar'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import { useTrainingSessions } from '@/features/journal/trainingsession/hooks'
import { usePhysicalSessions } from '@/features/journal/physicalsession/hooks'
import type { WeeklyStats } from '@/shared/api/dashboard'
import { useNavigate } from 'react-router-dom'
import { MONO } from '@/shared/lib/typography'

const BELT_ORDER = ['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'] as const
const BELT: Record<string, { label: string; color: string; text: string }> = {
  WHITE:  { label: 'Blanco',  color: '#d1d5db', text: '#111827' },
  BLUE:   { label: 'Azul',    color: '#3b82f6', text: '#ffffff' },
  PURPLE: { label: 'Morado',  color: '#9333ea', text: '#ffffff' },
  BROWN:  { label: 'Marrón',  color: '#92400e', text: '#ffffff' },
  BLACK:  { label: 'Negro',   color: '#111827', text: '#ffffff' },
}

const MODALITY: Record<string, string> = {
  GI: 'Gi', NOGI: 'No-Gi', BOTH: 'Gi + No-Gi',
}

const INTENSITY_LABELS: Record<string, string> = {
  LIGHT: 'Baja', MODERATE: 'Moderada', HARD: 'Alta', COMPETITION: 'Competición',
}
const INTENSITY_COLORS: Record<string, string> = {
  LIGHT: '#10b981', MODERATE: '#f59e0b', HARD: '#f97316', COMPETITION: '#e11d48',
}
const SESSION_TYPE_COLORS: Record<string, string> = {
  STRENGTH: '#f59e0b', CARDIO: '#10b981', FLEXIBILITY: '#a855f7',
  MOBILITY: '#3b82f6', HIIT: '#e11d48', OTHER: '#6b7280',
}
const SESSION_TYPE_LABELS: Record<string, string> = {
  STRENGTH: 'Fuerza', CARDIO: 'Cardio', FLEXIBILITY: 'Flexibilidad',
  MOBILITY: 'Movilidad', HIIT: 'HIIT', OTHER: 'Otro',
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function timeAtBelt(iso?: string | null) {
  if (!iso) return null
  const months = (new Date().getFullYear() - new Date(iso).getFullYear()) * 12
    + (new Date().getMonth() - new Date(iso).getMonth())
  if (months < 1) return 'Reciente'
  if (months < 12) return `${months}m`
  const y = Math.floor(months / 12), m = months % 12
  return m === 0 ? `${y}a` : `${y}a ${m}m`
}

function relativeDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso + 'T00:00:00').getTime()) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 7) return `Hace ${diff}d`
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function StatBox({ label, value, goal, sub, color }: {
  label: string; value: number | string; goal?: number; sub?: string; color: string
}) {
  const numVal = typeof value === 'number' ? value : 0
  const pct = goal ? Math.min(100, Math.round((numVal / goal) * 100)) : 0
  const exceeded = goal != null && numVal >= goal

  return (
    <div className="bg-card border border-border p-4 flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>{label}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-black leading-none tabular-nums" style={{ color }}>{value}</span>
        {goal != null && (
          <span className="text-sm font-bold text-muted-foreground" style={MONO}>/{goal}</span>
        )}
      </div>
      {sub && <span className="text-[9px] text-muted-foreground" style={MONO}>{exceeded && goal != null ? 'meta superada ✓' : sub}</span>}
      {goal != null && (
        <div className="h-[2px] bg-border mt-2">
          <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  )
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const { data: allFederations = [] } = useFederations()
  const { data: stats } = useQuery<WeeklyStats>({ queryKey: ['weekly-stats'], queryFn: fetchWeeklyStats })
  const { data: bjjData } = useTrainingSessions({ page: 0, size: 3 })
  const { data: physData } = usePhysicalSessions({ page: 0, size: 3 })
  const navigate = useNavigate()

  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())

  useEffect(() => {
    const handler = () => setAvatar(getAvatarFromStorage())
    window.addEventListener('ossflow_avatar_changed', handler)
    return () => window.removeEventListener('ossflow_avatar_changed', handler)
  }, [])

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Cargando...</div>

  if (!profile) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">No tienes perfil configurado todavía.</p>
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity"
          style={MONO}
        >
          Crear perfil
        </button>
      </div>
    )
  }

  const beltKey = profile.currentBelt.toUpperCase()
  const belt = BELT[beltKey] ?? { label: profile.currentBelt, color: '#6b7280', text: '#fff' }
  const initials = getInitials(profile.displayName)
  const beltTime = timeAtBelt(profile.beltSince)
  const primaryFed = profile.federations?.find(f => f.isPrimary)
  const primaryFedObj = primaryFed ? allFederations.find(f => f.id === primaryFed.federationId) : null
  const primaryFedName = primaryFedObj?.name ?? null
  const modalityLabel = MODALITY[profile.preferredModality?.toUpperCase?.()] ?? profile.preferredModality

  type RecentSession = { id: number; date: string; name: string; typeLabel: string; typeColor: string; duration?: number; route: string }
  const bjjSessions: RecentSession[] = (bjjData?.content ?? []).slice(0, 3).map(s => ({
    id: s.id,
    date: s.sessionDate,
    name: s.location || s.sessionDate,
    typeLabel: `BJJ · ${INTENSITY_LABELS[s.intensity] ?? s.intensity}`,
    typeColor: INTENSITY_COLORS[s.intensity] ?? '#6b7280',
    duration: s.durationMinutes,
    route: '/diario/bjj',
  }))
  const physSessions: RecentSession[] = (physData?.content ?? []).slice(0, 3).map(s => ({
    id: s.id,
    date: s.sessionDate,
    name: s.title,
    typeLabel: SESSION_TYPE_LABELS[s.sessionType] ?? s.sessionType,
    typeColor: SESSION_TYPE_COLORS[s.sessionType] ?? '#6b7280',
    duration: s.durationMinutes,
    route: '/diario/sesiones',
  }))
  const recentSessions = [...bjjSessions, ...physSessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-2">

      {/* ── HEADER ── */}
      <div
        className="bg-card border border-border flex items-center gap-5 px-6 py-5"
        style={{ borderLeft: `4px solid ${belt.color}` }}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center overflow-hidden flex-shrink-0 text-lg font-black"
          style={{
            width: 60, height: 60,
            backgroundColor: belt.color,
            color: belt.text,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {avatar
            ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            : initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            {profile.displayName}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5" style={MONO}>
            Cinturón {belt.label} · {modalityLabel}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
            {profile.academy && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={MONO}>
                <Building2 className="h-3 w-3" strokeWidth={1.5} />
                {profile.academy}
              </span>
            )}
            {beltTime && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={MONO}>
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                {beltTime} en cinturón
              </span>
            )}
            {primaryFedName && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={MONO}>
                <Shield className="h-3 w-3" strokeWidth={1.5} />
                {primaryFedName}
              </span>
            )}
          </div>
        </div>

        {/* Editar */}
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          className="flex items-center gap-1.5 px-3 py-2 border border-border text-[10px] font-bold uppercase tracking-wide hover:bg-muted transition-colors shrink-0 self-start"
          style={MONO}
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
          Editar
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatBox
          label="Racha"
          value={stats?.streakDays ?? '—'}
          sub="días consecutivos"
          color="#f97316"
        />
        <StatBox
          label="BJJ semana"
          value={stats?.bjjSessions ?? '—'}
          goal={stats?.bjjGoal}
          sub="sesiones"
          color="#3b82f6"
        />
        <StatBox
          label="Físico semana"
          value={stats?.physicalSessions ?? '—'}
          goal={stats?.physicalGoal}
          sub="sesiones"
          color="#10b981"
        />
        <StatBox
          label="Técnicas mes"
          value={stats?.techniquesThisMonth ?? '—'}
          sub="este mes"
          color="#a855f7"
        />
      </div>

      {/* ── COLUMNAS INFERIORES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

        {/* Últimas sesiones */}
        <div className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Últimas sesiones</span>
            <button
              type="button"
              onClick={() => navigate('/diario/bjj')}
              className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
              style={MONO}
            >
              → ver todas
            </button>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6" style={MONO}>Sin sesiones registradas aún</p>
          ) : (
            <div className="space-y-0">
              {recentSessions.map((s, i) => (
                <div
                  key={`${s.route}-${s.id}`}
                  className="flex items-start justify-between py-2.5 gap-3"
                  style={{ borderBottom: i < recentSessions.length - 1 ? '1px solid var(--color-border)' : undefined }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug truncate" style={{ fontFamily: 'var(--font-serif)' }}>{s.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ ...MONO, color: s.typeColor }}>{s.typeLabel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground" style={MONO}>{relativeDate(s.date)}</p>
                    {s.duration && <p className="text-[10px] text-muted-foreground" style={MONO}>{s.duration} min</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lesiones + progresión cinturón */}
        <div className="bg-card border border-border p-5 space-y-5">
          <InjurySection />

          {/* Barra de progresión de cinturón */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3" style={MONO}>Progresión cinturón</p>
            <div className="flex gap-1">
              {BELT_ORDER.map((b) => {
                const isActive = b === beltKey
                const isPast = BELT_ORDER.indexOf(b) < BELT_ORDER.indexOf(beltKey as typeof BELT_ORDER[number])
                return (
                  <div key={b} className="flex-1 space-y-1">
                    <div
                      className="h-2.5 w-full"
                      style={{
                        backgroundColor: isActive || isPast ? BELT[b].color : 'transparent',
                        border: isActive || isPast ? 'none' : '1px dashed var(--color-border)',
                        opacity: isPast ? 0.5 : 1,
                      }}
                    />
                    <p
                      className="text-[8px] text-center truncate"
                      style={{
                        ...MONO,
                        color: isActive ? BELT[b].color : 'var(--color-muted-foreground)',
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      {BELT[b].label}{isActive ? ' ●' : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
