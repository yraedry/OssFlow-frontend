// src/shared/components/layout/BottomTabBar.tsx
import { NavLink } from 'react-router-dom'
import {
  Home, BookOpen, Calendar, CalendarDays, Map, Layers, Shield,
  FileText, Dumbbell, Grid3X3, Trophy, User, Download,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const ALL_TABS = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/catalog/techniques', label: 'Técnicas', icon: BookOpen },
  { to: '/journal/training-sessions', label: 'Sesiones', icon: Calendar },
  { to: '/planning/study-plans', label: 'Planes', icon: CalendarDays },
  { to: '/catalog/positions', label: 'Posiciones', icon: Map },
  { to: '/catalog/systems', label: 'Sistemas', icon: Layers },
  { to: '/catalog/rulesets', label: 'Reglamentos', icon: Shield },
  { to: '/journal/notes', label: 'Notas', icon: FileText },
  { to: '/journal/physical-sessions', label: 'Físico', icon: Dumbbell },
  { to: '/planning/weekly-template', label: 'Plantilla', icon: Grid3X3 },
  { to: '/competition/logs', label: 'Competencias', icon: Trophy },
  { to: '/profile', label: 'Perfil', icon: User },
  { to: '/export', label: 'Exportar', icon: Download },
]

const NAV_MONO = { fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.06em' } as const

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border overflow-x-auto scrollbar-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-end min-w-max">
        {ALL_TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[44px] min-w-[52px] transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            <span className="uppercase whitespace-nowrap" style={NAV_MONO}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
