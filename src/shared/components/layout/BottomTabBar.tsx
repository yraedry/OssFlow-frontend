import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, Dumbbell, BarChart2, CalendarDays, LogOut, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useLogout } from '@/features/auth/hooks'

const TABS = [
  { to: '/',                       label: 'Inicio',        icon: Home,         end: true  },
  { to: '/diario/sesiones-bjj',    label: 'Diario',        icon: BookOpen,     end: false },
  { to: '/estudio/tecnicas',       label: 'Estudio',       icon: Dumbbell,     end: false },
  { to: '/planificacion/planes',   label: 'Planificación', icon: CalendarDays, end: false },
  { to: '/analisis',               label: 'Análisis',      icon: BarChart2,    end: false },
  { to: '/profile',                label: 'Perfil',        icon: User,         end: false },
]

const SUB_NAV: Record<string, { to: string; label: string; matchPaths?: string[] }[]> = {
  diario: [
    { to: '/diario/sesiones-bjj',     label: 'Sesiones BJJ' },
    { to: '/diario/sesiones-fisicas', label: 'Sesiones físicas' },
    { to: '/diario/movilidad',        label: 'Sesiones de movilidad', matchPaths: ['/diario/movilidad', '/diario/flexibilidad'] },
    { to: '/diario/notas',            label: 'Notas' },
    { to: '/diario/competicion',      label: 'Competición' },
  ],
  estudio: [
    { to: '/estudio/tecnicas',    label: 'Técnicas' },
    { to: '/estudio/posiciones',  label: 'Posiciones' },
    { to: '/estudio/sistemas',    label: 'Sistemas' },
    { to: '/estudio/ejercicios',  label: 'Físico' },
    { to: '/estudio/movilidad',   label: 'Movilidad' },
    { to: '/estudio/flexibilidad',label: 'Flexibilidad' },
    { to: '/estudio/reglamentos', label: 'Reglamentos' },
  ],
  planificacion: [
    { to: '/planificacion/planes',    label: 'Planes' },
    { to: '/planificacion/plantilla', label: 'Plantilla' },
    { to: '/planificacion/calendario',label: 'Calendario' },
  ],
  perfil: [
    { to: '/profile',        label: 'Perfil' },
    { to: '/configuracion',  label: 'Configuración' },
  ],
}

function getSection(pathname: string): string {
  if (pathname.startsWith('/diario') || pathname.startsWith('/journal') || pathname.startsWith('/competition'))
    return 'diario'
  if (pathname.startsWith('/estudio') || pathname.startsWith('/catalog') || pathname.startsWith('/physical'))
    return 'estudio'
  if (pathname.startsWith('/planificacion') || pathname.startsWith('/planning'))
    return 'planificacion'
  if (pathname.startsWith('/profile') || pathname.startsWith('/configuracion'))
    return 'perfil'
  return ''
}

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
  if (pathname.startsWith('/profile') || pathname.startsWith('/configuracion'))
    return '/profile'
  return ''
}

const MONO = { fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.06em' } as const
const SUBNAV_MONO = { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.04em' } as const

export function BottomTabBar() {
  const { pathname } = useLocation()
  const activeTab = getActiveTab(pathname)
  const section = getSection(pathname)
  const subNav = SUB_NAV[section] ?? []
  const hasSubNav = subNav.length > 0
  const logoutMutation = useLogout()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        '--bottom-bar-height': hasSubNav ? '88px' : '56px',
      } as React.CSSProperties}
    >
      {subNav.length > 0 && (
        <div className="border-t border-border/50 flex overflow-x-auto scrollbar-none">
          {subNav.map(({ to, label, matchPaths }) => {
            const isActive = matchPaths
              ? matchPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
              : undefined
            return (
              <NavLink
                key={to}
                to={to}
                end={!matchPaths}
                className={matchPaths
                  ? cn(
                      'flex-shrink-0 h-8 flex items-center px-3 uppercase transition-colors whitespace-nowrap border-b-2',
                      isActive
                        ? 'text-foreground border-foreground'
                        : 'text-muted-foreground border-transparent hover:text-foreground',
                    )
                  : ({ isActive }: { isActive: boolean }) =>
                      cn(
                        'flex-shrink-0 h-8 flex items-center px-3 uppercase transition-colors whitespace-nowrap border-b-2',
                        isActive
                          ? 'text-foreground border-foreground'
                          : 'text-muted-foreground border-transparent hover:text-foreground',
                      )
                }
                style={SUBNAV_MONO}
              >
                {label}
              </NavLink>
            )
          })}
          {section === 'perfil' && (
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex-shrink-0 h-8 flex items-center gap-1.5 px-3 uppercase transition-colors whitespace-nowrap border-b-2 border-transparent text-muted-foreground hover:text-foreground ml-auto"
              style={SUBNAV_MONO}
            >
              <LogOut className="h-3 w-3" strokeWidth={1.5} />
              Salir
            </button>
          )}
        </div>
      )}

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
