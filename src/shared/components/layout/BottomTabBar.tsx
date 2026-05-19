import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, Dumbbell, BarChart2, CalendarDays, LogOut, User, School, GraduationCap, MoreHorizontal, Settings, X, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/utils'
import { useLogout } from '@/features/auth/hooks'
import { useProfile } from '@/features/identity/profile/hooks'
import { useCoaches, useNoteUnreadCount, useNotifications, useMarkNotificationsRead, COACHING_KEYS } from '@/features/coaching/hooks'
import { NOTIFICATION_LABELS } from '@/features/coaching/notificationLabels'

type Tab = { to: string; label: string; icon: React.ElementType; end: boolean; badge?: number }

const FIXED_TABS: Tab[] = [
  { to: '/',                       label: 'Inicio',        icon: Home,         end: true  },
  { to: '/diario/sesiones-bjj',    label: 'Diario',        icon: BookOpen,     end: false },
  { to: '/estudio/tecnicas',       label: 'Estudio',       icon: Dumbbell,     end: false },
  { to: '/planificacion/planes',   label: 'Planif.',       icon: CalendarDays, end: false },
  { to: '/analisis',               label: 'Análisis',      icon: BarChart2,    end: false },
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
    { to: '/planificacion/rutinas',   label: 'Rutinas' },
  ],
  gimnasio: [
    { to: '/gimnasio/alumnos',       label: 'Alumnos' },
    { to: '/gimnasio/planificacion', label: 'Planificación' },
    { to: '/gimnasio/gimnasios',     label: 'Mis gimnasios' },
  ],
  maestro: [
    { to: '/maestro/notas',          label: 'Notas' },
    { to: '/maestro/planificacion',  label: 'Planificación' },
    { to: '/maestro/clases',         label: 'Clases' },
    { to: '/maestro/tecnicas',       label: 'Técnicas' },
  ],
}

function getSection(pathname: string): string {
  if (pathname.startsWith('/diario') || pathname.startsWith('/journal') || pathname.startsWith('/competition'))
    return 'diario'
  if (pathname.startsWith('/estudio') || pathname.startsWith('/catalog') || pathname.startsWith('/physical'))
    return 'estudio'
  if (pathname.startsWith('/planificacion') || pathname.startsWith('/planning'))
    return 'planificacion'
  if (pathname.startsWith('/gimnasio'))
    return 'gimnasio'
  if (pathname.startsWith('/maestro'))
    return 'maestro'
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
  return ''
}

const MONO = { fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.06em' } as const
const SUBNAV_MONO = { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.04em' } as const

export function BottomTabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeTab = getActiveTab(pathname)
  const section = getSection(pathname)
  const subNav = SUB_NAV[section] ?? []
  const logoutMutation = useLogout()
  const { data: profile } = useProfile()
  const { data: coaches } = useCoaches()
  const { data: unreadCount } = useNoteUnreadCount()
  const { data: notifications } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const qc = useQueryClient()
  const hasCoach = (coaches?.length ?? 0) > 0
  const isCoach = profile?.role === 'ATHLETE_COACH'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  // Snapshot capturado al abrir: leemos directo de la cache para evitar
  // el problema de batching donde notifications puede estar stale en el handler
  const [notifSnapshot, setNotifSnapshot] = useState<typeof notifications>(undefined)
  // Notificaciones a mostrar: snapshot mientras panel abierto, live data en otro caso
  const displayedNotifications = notifOpen && notifSnapshot !== undefined ? notifSnapshot : notifications

  const notifUnread = notifOpen ? 0 : (notifications?.filter(n => !n.read).length ?? 0)
  const moreBadge = (unreadCount ?? 0) + notifUnread > 0 ? (unreadCount ?? 0) + notifUnread : undefined

  // Determine if «Más» is currently active (user is in /maestro, /gimnasio, /profile, /configuracion)
  const isMoreActive =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/configuracion')

  return (
    <>
      {/* Backdrop when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* «Más» drawer — slides up from bottom */}
      {drawerOpen && (
      <div
        className="fixed left-0 right-0 z-50 bg-background border-t border-border"
        style={{
          bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '60vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const, color: 'var(--muted-foreground)' }}>
            Más opciones
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="py-2">
          {/* Perfil */}
          <button
            type="button"
            onClick={() => { navigate('/profile'); setDrawerOpen(false) }}
            className={cn(
              'w-full flex items-center gap-3 px-5 py-3 transition-colors',
              pathname.startsWith('/profile')
                ? 'text-foreground bg-foreground/[0.06]'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]',
            )}
          >
            <User className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const }}>Perfil</span>
          </button>

          {/* Configuración */}
          <button
            type="button"
            onClick={() => { navigate('/configuracion'); setDrawerOpen(false) }}
            className={cn(
              'w-full flex items-center gap-3 px-5 py-3 transition-colors',
              pathname.startsWith('/configuracion')
                ? 'text-foreground bg-foreground/[0.06]'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]',
            )}
          >
            <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const }}>Configuración</span>
          </button>

          {/* Gimnasio — solo si es coach */}
          {isCoach && (
            <button
              type="button"
              onClick={() => { navigate('/gimnasio'); setDrawerOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-3 transition-colors',
                pathname.startsWith('/gimnasio')
                  ? 'text-foreground bg-foreground/[0.06]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              <School className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const }}>Gimnasio</span>
            </button>
          )}

          {/* Maestro — solo si tiene coach */}
          {hasCoach && (
            <button
              type="button"
              onClick={() => { navigate('/maestro'); setDrawerOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between gap-3 px-5 py-3 transition-colors',
                pathname.startsWith('/maestro')
                  ? 'text-foreground bg-foreground/[0.06]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]',
              )}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const }}>Coaching</span>
              </div>
              {(unreadCount ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-bold bg-foreground text-background rounded-none">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Notificaciones — acordeón inline */}
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => {
                const next = !notifOpen
                setNotifOpen(next)
                if (next) {
                  // Leer directo de la cache para evitar valor stale del render anterior
                  type NotifData = typeof notifications
                  const cached = qc.getQueryData<NotifData>(COACHING_KEYS.notifications)
                  setNotifSnapshot(cached ?? [])
                  if ((cached?.filter(n => !n.read).length ?? 0) > 0) {
                    markRead.mutate()
                  }
                } else {
                  setNotifSnapshot(undefined)
                }
              }}
              className="w-full flex items-center justify-between gap-3 px-5 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const }}>Notificaciones</span>
                {notifUnread > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-bold bg-foreground text-background rounded-none">
                    {notifUnread}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground/50">{notifOpen ? '▲' : '▼'}</span>
            </button>
            {notifOpen && (
              <div className="max-h-60 overflow-y-auto border-t border-border/50">
                {(!displayedNotifications || displayedNotifications.length === 0) ? (
                  <div className="px-5 py-3">
                    <span style={{ ...SUBNAV_MONO, color: 'var(--muted-foreground)' }}>Sin notificaciones</span>
                  </div>
                ) : (
                  displayedNotifications.map(n => (
                    <div key={n.id} className="px-5 py-2.5 border-b border-border/50 last:border-b-0">
                      <p className="text-xs font-medium text-foreground">{NOTIFICATION_LABELS[n.type] ?? n.type}</p>
                      <p className="text-muted-foreground/50 mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={() => { logoutMutation.mutate(); setDrawerOpen(false) }}
            className="w-full flex items-center gap-3 px-5 py-3 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span style={{ ...SUBNAV_MONO, textTransform: 'uppercase' as const }}>Cerrar sesión</span>
          </button>
        </div>
      </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Subnav contextual */}
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
                    : ({ isActive: navActive }: { isActive: boolean }) =>
                        cn(
                          'flex-shrink-0 h-8 flex items-center px-3 uppercase transition-colors whitespace-nowrap border-b-2',
                          navActive
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
          </div>
        )}

        {/* Tab bar principal — 5 items fijos + «Más» */}
        <div className="flex items-end justify-around h-14">
          {FIXED_TABS.map(({ to, label, icon: Icon, end }) => {
            const isActive = end ? pathname === '/' : activeTab === to || pathname.startsWith(to)
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

          {/* Botón «Más» */}
          <button
            type="button"
            onClick={() => setDrawerOpen(o => !o)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[44px] flex-1 transition-colors relative',
              isMoreActive ? 'text-foreground' : 'text-muted-foreground',
            )}
            aria-label="Más opciones"
          >
            <div className="relative">
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
              {moreBadge != null && moreBadge > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 text-[8px] font-bold bg-foreground text-background rounded-none flex items-center justify-center">
                  {moreBadge}
                </span>
              )}
            </div>
            <span className="uppercase whitespace-nowrap" style={MONO}>Más</span>
          </button>
        </div>
      </nav>
    </>
  )
}
