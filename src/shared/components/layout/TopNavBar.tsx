// src/shared/components/layout/TopNavBar.tsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import { useProfile } from '@/features/identity/profile/hooks'

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
  { to: '/planning/weekly-template', label: 'Plantilla semanal' },
  { to: '/export', label: 'Exportar' },
  { to: '/trash', label: 'Papelera' },
]

type TopNavBarProps = {
  onSearchOpen: () => void
}

export function TopNavBar({ onSearchOpen }: TopNavBarProps) {
  const { theme, toggleTheme } = useTheme()
  const { data: profile } = useProfile()
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <header className="sticky top-0 z-30 flex h-12 items-stretch border-b border-border bg-background">
      <NavLink
        to="/"
        className="flex items-center px-5 border-r border-border"
        style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 900, letterSpacing: '-0.03em' }}
      >
        OSSFLOW
      </NavLink>

      <nav className="flex items-stretch flex-1">
        {PRIMARY_NAV.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 border-b-2 transition-colors h-full',
                'text-muted-foreground hover:text-foreground',
                isActive ? 'border-foreground text-foreground' : 'border-transparent',
              )
            }
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {label}
          </NavLink>
        ))}

        <div className="relative flex items-center">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'flex items-center gap-1 px-3 h-full border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors',
              moreOpen && 'text-foreground',
            )}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          {moreOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
              <div className="absolute top-full left-0 z-20 w-44 border border-border bg-background shadow-lg max-h-80 overflow-y-auto">
                {SECONDARY_NAV.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-b border-border last:border-b-0',
                        isActive && 'text-foreground bg-accent',
                      )
                    }
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-1 px-3 border-l border-border">
        <button
          onClick={onSearchOpen}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
        </button>
        <button
          onClick={() => navigate('/journal/training-sessions?new=bjj')}
          className="flex items-center gap-1.5 px-3 h-8 border border-foreground bg-foreground text-background hover:opacity-85 transition-opacity ml-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
          Registrar
        </button>
        <NavLink
          to="/profile"
          className="flex h-7 w-7 items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground transition-colors ml-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
          aria-label="Perfil"
        >
          {initials}
        </NavLink>
      </div>
    </header>
  )
}
