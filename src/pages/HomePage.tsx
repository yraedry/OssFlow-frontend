import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import { useTrainingSessions } from '@/features/journal/trainingsession/hooks'
import { usePhysicalSessions } from '@/features/journal/physicalsession/hooks'
import { useWeeklyTemplate } from '@/features/planning/weeklytemplate/hooks'
import { cn } from '@/shared/lib/utils'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

function javaDayOfWeek(date: Date): string {
  return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()]
}

export function HomePage() {
  const navigate = useNavigate()
  const today = new Date()

  const { data: stats } = useQuery({ queryKey: ['weekly-stats'], queryFn: fetchWeeklyStats })
  const { data: bjjData } = useTrainingSessions()
  const { data: physData } = usePhysicalSessions({ page: 0, size: 10 })
  const { data: template } = useWeeklyTemplate()

  const bjjSessions = bjjData?.content?.filter(Boolean) ?? []
  const physSessions = physData?.content?.filter(Boolean) ?? []

  const todayKey = javaDayOfWeek(today)
  const todayEntry = template?.days?.find((d) => d.dayOfWeek === todayKey)

  const hasBjjToday = bjjSessions.some((s) => isSameDay(new Date(s.sessionDate), today))
  const hasStrengthToday = physSessions.some(
    (s) => isSameDay(new Date(s.sessionDate), today) && s.sessionType === 'STRENGTH',
  )
  const hasCardioToday = physSessions.some(
    (s) => isSameDay(new Date(s.sessionDate), today) && s.sessionType === 'CARDIO',
  )

  type TodayItem = { type: string; label: string; done: boolean; color: string }
  const todayItems: TodayItem[] = []
  if (todayEntry?.cardio) todayItems.push({ type: 'Cardio', label: '1h zona 2', done: hasCardioToday, color: '#10b981' })
  if (todayEntry?.strength) todayItems.push({ type: 'Fuerza', label: 'Sesión de fuerza', done: hasStrengthToday, color: '#f59e0b' })
  if (todayEntry?.bjj) todayItems.push({ type: 'BJJ', label: 'Sesión grappling', done: hasBjjToday, color: '#4a7cff' })

  const recentSessions = [
    ...bjjSessions.slice(0, 3).map((s) => ({
      type: 'BJJ',
      date: s.sessionDate,
      name: s.location ? `BJJ — ${s.location}` : 'Sesión BJJ',
      to: '/journal/training-sessions',
      id: `bjj-${s.id}`,
    })),
    ...physSessions.slice(0, 3).map((s) => ({
      type: s.sessionType === 'STRENGTH' ? 'Fuerza' : s.sessionType === 'CARDIO' ? 'Cardio' : s.sessionType,
      date: s.sessionDate,
      name: s.title,
      to: '/journal/physical-sessions',
      id: `phys-${s.id}`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  const bjjPct = stats ? Math.min((stats.bjjSessions / stats.bjjGoal) * 100, 100) : 0
  const physPct = stats ? Math.min((stats.physicalSessions / stats.physicalGoal) * 100, 100) : 0

  return (
    <div className="w-full space-y-2">

      {/* Saludo */}
      <div className="border border-border bg-card px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h1 className="leading-none" style={{ ...SERIF, fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Buenas, Adrián.
          </h1>
          <span style={{ ...MONO, fontSize: '12px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {format(today, "EEEE, d 'de' MMMM", { locale: es })}
          </span>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">

        {/* HOY TOCA */}
        <div className="md:col-span-7 border border-foreground bg-card p-5">
          <div className="flex items-center gap-2 mb-4" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>
            <span style={{ color: 'var(--color-foreground)' }}>▶</span>
            Hoy toca
          </div>

          {todayItems.length === 0 ? (
            <div className="py-6 text-center" style={{ ...MONO, fontSize: '11px', color: 'var(--color-muted-foreground)' }}>
              {template ? (
                'Hoy es día de descanso.'
              ) : (
                <span>
                  Sin plantilla configurada.{' '}
                  <Link to="/planning/weekly-template" className="underline hover:text-foreground transition-colors">
                    Configúrala aquí →
                  </Link>
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {todayItems.map((item) => (
                <div key={item.type} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                  <div className={cn(
                    'w-4 h-4 shrink-0 border flex items-center justify-center',
                    item.done ? 'bg-foreground border-foreground' : 'border-border',
                  )}>
                    {item.done && <span style={{ fontSize: '10px', color: 'var(--color-background)', fontWeight: 700 }}>✓</span>}
                  </div>
                  <div className="flex-1">
                    <div style={{ ...LABEL, color: item.color, marginBottom: '2px' }}>{item.type}</div>
                    <div className={cn('font-semibold', item.done && 'line-through text-muted-foreground')} style={{ ...SERIF, fontSize: '15px' }}>
                      {item.label}
                    </div>
                  </div>
                  {item.done && (
                    <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>Registrado</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RACHA + STATS + BOTÓN */}
        <div className="md:col-span-5 border border-border bg-card p-5 flex flex-col gap-4">

          {/* Racha */}
          <div>
            <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '6px' }}>Racha activa</div>
            <div className="flex items-baseline gap-2">
              <span style={{ ...SERIF, fontSize: 'clamp(40px, 4vw, 56px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {stats?.streakDays ?? 0}
              </span>
              <span style={{ ...MONO, fontSize: '13px', color: 'var(--color-muted-foreground)' }}>días</span>
            </div>
            <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', opacity: 0.6 }}>
              consecutivos entrenando
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'BJJ semana', val: stats?.bjjSessions ?? 0, goal: stats?.bjjGoal ?? 5, pct: bjjPct },
              { label: 'Físico semana', val: stats?.physicalSessions ?? 0, goal: stats?.physicalGoal ?? 3, pct: physPct },
            ].map(({ label, val, goal, pct }) => (
              <div key={label}>
                <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>{label}</div>
                <div style={{ ...SERIF, fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>
                  {val}
                  <span style={{ ...MONO, fontSize: '13px', fontWeight: 400, color: 'var(--color-muted-foreground)' }}> / {goal}</span>
                </div>
                <div className="mt-1.5 h-px bg-border">
                  <div className="h-px bg-foreground transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Botón registrar */}
          <button
            onClick={() => navigate('/journal/training-sessions?new=bjj')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background hover:opacity-85 transition-opacity mt-auto"
            style={{ ...MONO, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Registrar sesión
          </button>

          <Link
            to="/journal/training-sessions"
            className="text-center text-muted-foreground hover:text-foreground transition-colors"
            style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Ver todas las sesiones →
          </Link>
        </div>
      </div>

      {/* Sesiones recientes */}
      {recentSessions.length > 0 && (
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>Últimas sesiones</span>
            <div className="flex gap-4">
              <Link to="/journal/training-sessions" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }} className="hover:text-foreground transition-colors">BJJ →</Link>
              <Link to="/journal/physical-sessions" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }} className="hover:text-foreground transition-colors">Físico →</Link>
            </div>
          </div>
          {recentSessions.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-accent transition-colors"
            >
              <span className="border px-1.5 py-0.5 shrink-0" style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>
                {item.type}
              </span>
              <span className="flex-1 truncate text-foreground" style={{ ...SERIF, fontSize: '14px' }}>{item.name}</span>
              <span style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}>{item.date}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
