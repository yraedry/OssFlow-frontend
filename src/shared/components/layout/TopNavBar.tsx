import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search, Sun, Moon, Settings, LogOut } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import { useProfile } from '@/features/identity/profile/hooks'
import { getAvatarFromStorage } from '@/shared/hooks/useAvatar'
import { useLogout } from '@/features/auth/hooks'

const PRIMARY_NAV = [
  { to: '/',                    label: 'Inicio',        end: true,  section: null },
  { to: '/diario/sesiones-bjj', label: 'Diario',        end: false, section: 'diario' },
  { to: '/estudio/tecnicas',    label: 'Estudio',       end: false, section: 'estudio' },
  { to: '/planificacion/planes',label: 'Planificación', end: false, section: 'planificacion' },
  { to: '/analisis',            label: 'Análisis',      end: false, section: 'analisis' },
]

const SUB_NAV: Record<string, { to: string; label: string; matchPaths?: string[] }[]> = {
  diario: [
    { to: '/diario/sesiones-bjj',    label: 'Sesiones BJJ' },
    { to: '/diario/sesiones-fisicas', label: 'Sesiones físicas' },
    { to: '/diario/movilidad',       label: 'Sesiones de movilidad', matchPaths: ['/diario/movilidad', '/diario/flexibilidad'] },
    { to: '/diario/notas',           label: 'Notas' },
    { to: '/diario/competicion',     label: 'Competición' },
  ],
  estudio: [
    { to: '/estudio/tecnicas',    label: 'Técnicas' },
    { to: '/estudio/posiciones',  label: 'Posiciones' },
    { to: '/estudio/sistemas',    label: 'Sistemas' },
    { to: '/estudio/ejercicios',  label: 'Ejercicios' },
    { to: '/estudio/movilidad',   label: 'Movilidad' },
    { to: '/estudio/flexibilidad',label: 'Flexibilidad' },
    { to: '/estudio/reglamentos', label: 'Reglamentos' },
  ],
  planificacion: [
    { to: '/planificacion/planes',    label: 'Planes' },
    { to: '/planificacion/plantilla', label: 'Plantilla' },
    { to: '/planificacion/calendario',label: 'Calendario' },
  ],
}

function getSection(pathname: string): string | null {
  if (pathname === '/') return null
  if (pathname.startsWith('/diario') || pathname.startsWith('/journal') || pathname.startsWith('/competition'))
    return 'diario'
  if (pathname.startsWith('/estudio') || pathname.startsWith('/catalog') || pathname.startsWith('/physical'))
    return 'estudio'
  if (pathname.startsWith('/planificacion') || pathname.startsWith('/planning'))
    return 'planificacion'
  if (pathname.startsWith('/analisis'))
    return 'analisis'
  return null
}

const MONO = {
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

type TopNavBarProps = { onSearchOpen: () => void }

export function TopNavBar({ onSearchOpen }: TopNavBarProps) {
  const { theme, toggleTheme } = useTheme()
  const { data: profile } = useProfile()
  const logoutMutation = useLogout()
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())
  const { pathname } = useLocation()
  const activeSection = getSection(pathname)
  const subNav = activeSection ? (SUB_NAV[activeSection] ?? []) : []

  useEffect(() => {
    const handler = () => setAvatar(getAvatarFromStorage())
    window.addEventListener('ossflow_avatar_changed', handler)
    return () => window.removeEventListener('ossflow_avatar_changed', handler)
  }, [])

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      {/* Fila 1: logo + nav primaria + acciones */}
      <div className="flex h-10 items-stretch">
        <NavLink
          to="/"
          className="flex items-center px-4 border-r border-border shrink-0 gap-2"
          aria-label="OssFlow — Inicio"
        >
          {/* Logo: símbolo cinturón BJJ */}
          <svg width="22" height="22" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="6" y="29" width="68" height="22" fill="currentColor"/>
            <rect x="34" y="19" width="12" height="42" fill="currentColor"/>
            <rect x="37" y="22" width="6" height="36" fill="var(--color-background)"/>
            <rect x="6" y="39" width="28" height="3" fill="var(--color-background)"/>
            <rect x="46" y="39" width="28" height="3" fill="var(--color-background)"/>
            <rect x="30" y="51" width="8" height="13" fill="currentColor"/>
            <rect x="42" y="51" width="8" height="13" fill="currentColor"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            OssFlow
          </span>
        </NavLink>

        <nav className="flex items-stretch flex-1 min-w-0 overflow-x-auto scrollbar-none">
          {PRIMARY_NAV.map(({ to, label, end, section }) => {
            const isActive = section ? activeSection === section : pathname === '/'
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={cn(
                  'flex items-center gap-1.5 px-4 border-b-2 transition-colors h-full shrink-0',
                  'text-muted-foreground hover:text-foreground',
                  isActive ? 'border-foreground text-foreground' : 'border-transparent',
                )}
                style={{ ...MONO, fontSize: '12px' }}
              >
                {label}
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-0.5 px-2 border-l border-border shrink-0">
          <button
            onClick={onSearchOpen}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === 'dark'
              ? <Sun className="h-3.5 w-3.5" strokeWidth={1.5} />
              : <Moon className="h-3.5 w-3.5" strokeWidth={1.5} />}
          </button>
          <NavLink
            to="/configuracion"
            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Configuración"
          >
            <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
          </NavLink>
          <NavLink
            to="/profile"
            className="flex h-7 w-7 items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground transition-colors ml-1 overflow-hidden rounded-full"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.02em' }}
            aria-label="Perfil"
          >
            {avatar
              ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              : initials}
          </NavLink>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Fila 2: subnav contextual */}
      {subNav.length > 0 && (
        <div className="flex h-8 items-stretch overflow-x-auto scrollbar-none border-t border-border/50 px-4">
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
                      'flex items-center px-3 border-b-2 transition-colors h-full shrink-0 whitespace-nowrap',
                      'text-muted-foreground hover:text-foreground',
                      isActive ? 'border-foreground text-foreground' : 'border-transparent',
                    )
                  : ({ isActive: navActive }) =>
                      cn(
                        'flex items-center px-3 border-b-2 transition-colors h-full shrink-0 whitespace-nowrap',
                        'text-muted-foreground hover:text-foreground',
                        navActive ? 'border-foreground text-foreground' : 'border-transparent',
                      )
                }
                style={{ ...MONO, fontSize: '11px' }}
              >
                {label}
              </NavLink>
            )
          })}
        </div>
      )}
    </header>
  )
}
