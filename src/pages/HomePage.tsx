import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import { useTrainingSessions } from '@/features/journal/trainingsession/hooks'
import { usePhysicalSessions } from '@/features/journal/physicalsession/hooks'
import { cn } from '@/shared/lib/utils'

export function HomePage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['weekly-stats'],
    queryFn: fetchWeeklyStats,
  })

  const { data: bjjData } = useTrainingSessions()
  const { data: physData } = usePhysicalSessions({ page: 0, size: 5 })

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const bjjSessions = bjjData?.content?.filter(Boolean) ?? []
  const physSessions = physData?.content?.filter(Boolean) ?? []

  const hasBjjOnDay = (day: Date) =>
    bjjSessions.some((s) => isSameDay(new Date(s.sessionDate), day))
  const hasPhysOnDay = (day: Date) =>
    physSessions.some((s) => isSameDay(new Date(s.sessionDate), day))

  const bjjPct = stats ? Math.min((stats.bjjSessions / stats.bjjGoal) * 100, 100) : 0
  const physPct = stats ? Math.min((stats.physicalSessions / stats.physicalGoal) * 100, 100) : 0

  const BJJ_R = 34
  const GYM_R = 23
  const circumference = (r: number) => 2 * Math.PI * r
  const dashArray = (pct: number, r: number) => {
    const c = circumference(r)
    return `${(pct / 100) * c} ${c - (pct / 100) * c}`
  }
  const dashOffset = (r: number) => circumference(r) * 0.25

  return (
    <div className="space-y-0 max-w-2xl md:max-w-4xl mx-auto">
      {/* Greeting */}
      <div className="pb-4 border-b border-border mb-4">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Buenas.
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {format(today, "EEEE d 'de' MMMM", { locale: es })} · Semana {stats?.weekNumber ?? '—'}
        </p>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 md:gap-3 mb-1 md:mb-2">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today)
          const bjj = hasBjjOnDay(day)
          const phys = hasPhysOnDay(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border flex flex-col items-center py-1.5 md:py-3 px-0',
                isToday ? 'border-foreground bg-foreground' : 'border-border bg-card',
              )}
            >
              <span
                className={cn('uppercase', isToday ? 'text-background' : 'text-muted-foreground')}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', letterSpacing: '0.06em' }}
              >
                {format(day, 'EEE', { locale: es }).slice(0, 2)}
              </span>
              <span
                className={cn('font-bold leading-tight', isToday ? 'text-background' : 'text-foreground')}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(13px, 1.2vw, 18px)' }}
              >
                {format(day, 'd')}
              </span>
              <div className="flex gap-0.5 mt-1 min-h-[5px]">
                {bjj && <div className={cn('w-1 h-1 rounded-full', isToday ? 'bg-background' : 'bg-foreground')} />}
                {phys && <div className={cn('w-1 h-1 rounded-full', isToday ? 'bg-background/60' : 'bg-muted-foreground')} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 pt-1">
        {[
          { dot: 'bg-foreground', label: 'BJJ' },
          { dot: 'bg-muted-foreground', label: 'Físico' },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('w-1.5 h-1.5 rounded-full', dot)} />
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Stats band + rings */}
      {statsLoading ? (
        <div className="py-4 text-center text-muted-foreground text-sm">Cargando estadísticas...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 border border-border mb-4">
            {[
              { val: stats?.bjjSessions ?? 0, label: 'BJJ', sub: 'esta semana' },
              { val: stats?.physicalSessions ?? 0, label: 'Físico', sub: 'esta semana' },
              { val: stats?.streakDays ?? 0, label: 'Racha', sub: 'días' },
            ].map(({ val, label, sub }, i) => (
              <div key={label} className={cn('py-3 md:py-5 text-center', i < 2 && 'border-r border-border')}>
                <div className="leading-none" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 48px)', fontWeight: 900 }}>
                  {val}
                </div>
                <div className="mt-1 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', color: 'var(--color-muted-foreground)', opacity: 0.5 }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 md:gap-6 p-3 md:p-5 border border-border mb-4">
            <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0 md:w-24 md:h-24">
              <circle cx="40" cy="40" r={BJJ_R} fill="none" stroke="var(--color-border)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r={BJJ_R} fill="none"
                stroke="var(--color-foreground)" strokeWidth="7"
                strokeDasharray={dashArray(bjjPct, BJJ_R)}
                strokeDashoffset={dashOffset(BJJ_R)}
                strokeLinecap="butt"
              />
              <circle cx="40" cy="40" r={GYM_R} fill="none" stroke="var(--color-border)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r={GYM_R} fill="none"
                stroke="var(--color-muted-foreground)" strokeWidth="7"
                strokeDasharray={dashArray(physPct, GYM_R)}
                strokeDashoffset={dashOffset(GYM_R)}
                strokeLinecap="butt"
              />
              <text x="40" y="37" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', fill: 'var(--color-muted-foreground)', fontWeight: 700 }}>METAS</text>
              <text x="40" y="47" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fill: 'var(--color-foreground)', fontWeight: 700 }}>
                {(stats?.bjjSessions ?? 0) + (stats?.physicalSessions ?? 0)}/{(stats?.bjjGoal ?? 4) + (stats?.physicalGoal ?? 3)}
              </text>
            </svg>
            <div className="flex-1 space-y-2 md:space-y-3">
              {[
                { dot: 'bg-foreground', label: 'BJJ semanal', val: `${stats?.bjjSessions ?? 0}`, sub: `/ ${stats?.bjjGoal ?? 4}` },
                { dot: 'bg-muted-foreground', label: 'Físico semanal', val: `${stats?.physicalSessions ?? 0}`, sub: `/ ${stats?.physicalGoal ?? 3}` },
                { dot: 'bg-border border border-muted-foreground', label: 'Racha activa', val: `${stats?.streakDays ?? 0}d`, sub: '' },
              ].map(({ dot, label, val, sub }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
                  <span className="flex-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {label}
                  </span>
                  <span className="font-bold text-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.8vw, 13px)' }}>{val}</span>
                  {sub && <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)' }}>{sub}</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Últimas sesiones */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm md:text-base font-semibold" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            Últimas sesiones
          </h2>
          <div className="flex gap-3">
            <Link to="/journal/training-sessions" className="text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              BJJ →
            </Link>
            <Link to="/journal/physical-sessions" className="text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Físico →
            </Link>
          </div>
        </div>

        {[
          ...bjjSessions.slice(0, 3).map((s) => ({
            type: 'BJJ' as const,
            date: s.sessionDate,
            name: s.location ? `BJJ — ${s.location}` : 'Sesión BJJ',
            id: s.id,
            to: '/journal/training-sessions',
          })),
          ...physSessions.slice(0, 2).map((s) => ({
            type: 'GYM' as const,
            date: s.sessionDate,
            name: s.title,
            id: s.id,
            to: '/journal/physical-sessions',
          })),
        ]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5)
          .map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.to}
              className="flex items-center gap-2 py-2 md:py-3 border-b border-border hover:bg-accent transition-colors px-1"
            >
              <span
                className={cn(
                  'border px-1.5 py-0.5 shrink-0',
                  item.type === 'BJJ' ? 'border-foreground text-foreground' : 'border-muted-foreground text-muted-foreground',
                )}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 0.6vw, 11px)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                {item.type}
              </span>
              <span className="flex-1 text-sm md:text-base text-foreground truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                {item.name}
              </span>
              <span className="text-muted-foreground shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px, 0.7vw, 12px)' }}>
                {item.date}
              </span>
            </Link>
          ))}
      </div>
    </div>
  )
}
