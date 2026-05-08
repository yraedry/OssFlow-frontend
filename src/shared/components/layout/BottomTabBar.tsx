import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, Dumbbell, CalendarDays, BarChart2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const TABS = [
  { to: '/',                     label: 'Inicio',        icon: Home,         end: true  },
  { to: '/diario/sesiones-bjj',  label: 'Diario',        icon: BookOpen,     end: false },
  { to: '/estudio/tecnicas',     label: 'Estudio',       icon: Dumbbell,     end: false },
  { to: '/planificacion/planes', label: 'Planificación', icon: CalendarDays, end: false },
  { to: '/analisis',             label: 'Análisis',      icon: BarChart2,    end: false },
]

function getActiveTab(pathname: string): string {
  if (pathname === '/') return '/'
  if (pathname.startsWith('/diario') || pathname.startsWith('/journal') || pathname.startsWith('/competition'))
    return '/diario/sesiones-bjj'
  if (pathname.startsWith('/estudio') || pathname.startsWith('/catalog') || pathname.startsWith('/physical'))
    return '/estudio/tecnicas'
  if (pathname.startsWith('/planificacion') || pathname.startsWith('/planning'))
    return '/planificacion/planes'
  if (pathname.startsWith('/analisis'))
    return '/analisis'
  return ''
}

const MONO = { fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.06em' } as const

export function BottomTabBar() {
  const { pathname } = useLocation()
  const activeTab = getActiveTab(pathname)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-end justify-around">
        {TABS.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? pathname === '/' : activeTab === to
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[44px] flex-1 transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="uppercase whitespace-nowrap" style={MONO}>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
