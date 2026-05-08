// src/shared/components/layout/TopNavBar.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search, Sun, Moon, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import { useProfile } from '@/features/identity/profile/hooks'
import { getAvatarFromStorage } from '@/shared/hooks/useAvatar'

const PRIMARY_NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog/techniques', label: 'Técnicas' },
  { to: '/journal/training-sessions', label: 'Sesiones' },
  { to: '/planning/study-plans', label: 'Planes' },
]

const SECONDARY_NAV = [
  { to: '/catalog/positions', label: 'Posiciones' },
  { to: '/catalog/rulesets', label: 'Reglamentos' },
  { to: '/catalog/systems', label: 'Sistemas' },
  { to: '/competition/logs', label: 'Competencias' },
  { to: '/journal/notes', label: 'Notas' },
  { to: '/journal/physical-sessions', label: 'Físico' },
  { to: '/planning/weekly-template', label: 'Plantilla' },
  { to: '/export', label: 'Exportar' },
]

const NAV_STYLE_PRIMARY = {
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

const NAV_STYLE_SECONDARY = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

type TopNavBarProps = {
  onSearchOpen: () => void
}

export function TopNavBar({ onSearchOpen }: TopNavBarProps) {
  const { theme, toggleTheme } = useTheme()
  const { data: profile } = useProfile()
  const navigate = useNavigate()
  const [avatar, setAvatar] = useState<string | null>(() => getAvatarFromStorage())

  useEffect(() => {
    const handler = () => setAvatar(getAvatarFromStorage())
    window.addEventListener('ossflow_avatar_changed', handler)
    return () => window.removeEventListener('ossflow_avatar_changed', handler)
  }, [])

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      {/* Fila 1: logo + nav primaria + acciones */}
      <div className="flex h-10 items-stretch">
        <NavLink
          to="/"
          className="flex items-center px-4 border-r border-border shrink-0"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          OSSFLOW
        </NavLink>

        <nav className="flex items-stretch flex-1 min-w-0">
          {PRIMARY_NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 border-b-2 transition-colors h-full shrink-0',
                  'text-muted-foreground hover:text-foreground',
                  isActive ? 'border-foreground text-foreground' : 'border-transparent',
                )
              }
              style={NAV_STYLE_PRIMARY}
            >
              {label}
            </NavLink>
          ))}
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
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Moon className="h-3.5 w-3.5" strokeWidth={1.5} />}
          </button>
          <button
            onClick={() => navigate('/journal/training-sessions?new=bjj')}
            className="flex items-center gap-1 px-2.5 h-7 border border-foreground bg-foreground text-background hover:opacity-85 transition-opacity ml-1"
            style={NAV_STYLE_PRIMARY}
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
            Registrar
          </button>
          <NavLink
            to="/profile"
            className="flex h-7 w-7 items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground transition-colors ml-1 overflow-hidden rounded-full"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.02em' }}
            aria-label="Perfil"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </NavLink>
        </div>
      </div>

      {/* Fila 2: nav secundaria */}
      <div className="flex h-8 items-stretch overflow-x-auto scrollbar-none border-t border-border/50 px-4">
        {SECONDARY_NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 border-b-2 transition-colors h-full shrink-0 whitespace-nowrap',
                'text-muted-foreground hover:text-foreground',
                isActive ? 'border-foreground text-foreground' : 'border-transparent',
              )
            }
            style={NAV_STYLE_SECONDARY}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}
