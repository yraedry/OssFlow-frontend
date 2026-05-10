import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, ArrowRight, Dumbbell, BookOpen, LayoutGrid } from 'lucide-react'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import { useTrainingSessions } from '@/features/journal/trainingsession/hooks'
import { usePhysicalSessions } from '@/features/journal/physicalsession/hooks'
import { useWeeklyTemplate } from '@/features/planning/weeklytemplate/hooks'
import { QuickLogDialog } from '@/features/journal/trainingsession/components/QuickLogDialog'
import { DashboardStats } from './DashboardStats'
import { cn } from '@/shared/lib/utils'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

function javaDayOfWeek(date: Date): string {
  return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()]
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function HomePage() {
  const today = new Date()
  const [quickLogOpen, setQuickLogOpen] = useState(false)

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
      to: `/diario/sesiones-bjj#session-${s.id}`,
      id: `bjj-${s.id}`,
      color: '#4a7cff',
    })),
    ...physSessions.slice(0, 3).map((s) => ({
      type: s.sessionType === 'STRENGTH' ? 'Fuerza' : s.sessionType === 'CARDIO' ? 'Cardio' : s.sessionType,
      date: s.sessionDate,
      name: s.title,
      to: `/diario/sesiones-fisicas#session-${s.id}`,
      id: `phys-${s.id}`,
      color: s.sessionType === 'STRENGTH' ? '#f59e0b' : '#10b981',
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const bjjPct = stats ? Math.min((stats.bjjSessions / stats.bjjGoal) * 100, 100) : 0
  const physPct = stats ? Math.min((stats.physicalSessions / stats.physicalGoal) * 100, 100) : 0

  return (
    <div className="w-full space-y-3">

      {/* Saludo principal */}
      <div className="border border-border bg-card px-5 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>
              {format(today, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
            <h1 className="leading-none" style={{ ...SERIF, fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              {getGreeting(today.getHours())}, Adrián.
            </h1>
          </div>
          <button
            onClick={() => setQuickLogOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity shrink-0 self-start sm:self-center"
            style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Registrar sesión
          </button>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

        {/* HOY TOCA */}
        <div className="md:col-span-7 border border-foreground bg-card p-5">
          <div className="flex items-center gap-2 mb-4" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>
            <span style={{ color: 'var(--color-foreground)' }}>▶</span>
            Hoy toca
          </div>

          {todayItems.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <p style={{ ...MONO, fontSize: '11px', color: 'var(--color-muted-foreground)' }}>
                {template ? 'Hoy es día de descanso. Recupérate bien.' : (
                  <span>
                    Sin plantilla configurada.{' '}
                    <Link to="/planificacion/plantilla" className="underline hover:text-foreground transition-colors">
                      Configúrala aquí →
                    </Link>
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {todayItems.map((item) => (
                <div
                  key={item.type}
                  className={cn(
                    'flex items-center gap-3 py-3.5 border-b border-border last:border-b-0 transition-colors',
                    !item.done && item.type === 'BJJ' && 'cursor-pointer hover:bg-accent/40',
                  )}
                  onClick={!item.done && item.type === 'BJJ' ? () => setQuickLogOpen(true) : undefined}
                >
                  <div
                    className={cn(
                      'w-5 h-5 shrink-0 border-2 flex items-center justify-center rounded-sm',
                      item.done ? 'border-transparent' : 'border-border',
                    )}
                    style={item.done ? { backgroundColor: item.color } : {}}
                  >
                    {item.done && <span style={{ fontSize: '10px', color: '#fff', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ ...LABEL, color: item.color, marginBottom: '2px' }}>{item.type}</div>
                    <div className={cn('font-semibold truncate', item.done && 'line-through text-muted-foreground')} style={{ ...SERIF, fontSize: '15px' }}>
                      {item.label}
                    </div>
                  </div>
                  {item.done ? (
                    <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>✓ Hecho</span>
                  ) : item.type === 'BJJ' ? (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RACHA + STATS */}
        <div className="md:col-span-5 border border-border bg-card p-5 flex flex-col gap-4">

          {/* Racha */}
          <div className="pb-4 border-b border-border">
            <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '6px' }}>Racha activa</div>
            <div className="flex items-baseline gap-2">
              <span style={{ ...SERIF, fontSize: 'clamp(40px, 4vw, 56px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', color: stats && stats.streakDays > 0 ? '#f97316' : 'var(--color-foreground)' }}>
                {stats?.streakDays ?? 0}
              </span>
              <span style={{ ...MONO, fontSize: '13px', color: 'var(--color-muted-foreground)' }}>días</span>
            </div>
          </div>

          {/* Stats semana */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'BJJ semana', val: stats?.bjjSessions ?? 0, goal: stats?.bjjGoal ?? 5, pct: bjjPct, color: '#4a7cff' },
              { label: 'Físico semana', val: stats?.physicalSessions ?? 0, goal: stats?.physicalGoal ?? 3, pct: physPct, color: '#10b981' },
            ].map(({ label, val, goal, pct, color }) => (
              <div key={label} className="space-y-1">
                <div style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>{label}</div>
                <div style={{ ...SERIF, fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>
                  {val}
                  <span style={{ ...MONO, fontSize: '12px', fontWeight: 400, color: 'var(--color-muted-foreground)' }}> / {goal}</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Links rápidos */}
          <div className="grid grid-cols-3 gap-2 mt-auto pt-2 border-t border-border">
            {[
              { icon: <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.5} />, label: 'Diario', to: '/diario/sesiones-bjj' },
              { icon: <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />, label: 'Estudio', to: '/estudio/tecnicas' },
              { icon: <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />, label: 'Análisis', to: '/analisis' },
            ].map(({ icon, label, to }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1.5 py-2 rounded-sm border border-border hover:border-foreground hover:bg-accent/30 transition-colors"
              >
                <span className="text-muted-foreground">{icon}</span>
                <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Catálogo rápido */}
      <DashboardStats />

      {/* Sesiones recientes */}
      {recentSessions.length > 0 && (
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>Últimas sesiones</span>
            <div className="flex gap-4">
              <Link to="/diario/sesiones-bjj" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }} className="hover:text-foreground transition-colors flex items-center gap-1">BJJ <ArrowRight className="h-3 w-3" strokeWidth={1.5} /></Link>
              <Link to="/diario/sesiones-fisicas" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }} className="hover:text-foreground transition-colors flex items-center gap-1">Físico <ArrowRight className="h-3 w-3" strokeWidth={1.5} /></Link>
            </div>
          </div>
          {recentSessions.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-accent/40 transition-colors"
            >
              <span
                className="border px-2 py-0.5 shrink-0"
                style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', borderColor: item.color, color: item.color }}
              >
                {item.type}
              </span>
              <span className="flex-1 truncate" style={{ ...SERIF, fontSize: '14px' }}>{item.name}</span>
              <span style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}>{item.date}</span>
            </Link>
          ))}
        </div>
      )}

      <QuickLogDialog open={quickLogOpen} onOpenChange={setQuickLogOpen} />
    </div>
  )
}
