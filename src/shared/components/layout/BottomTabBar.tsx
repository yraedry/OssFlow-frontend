// src/shared/components/layout/BottomTabBar.tsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Calendar, User, Grid3X3, Map, Trophy, FileText, Dumbbell, CalendarDays, Download, Shield, Layers } from 'lucide-react'
import { cn } from '@/shared/lib/utils'


const MORE_ITEMS = [
  { section: 'Catálogo', items: [
    { to: '/catalog/positions', label: 'Posiciones', icon: Map },
    { to: '/catalog/systems', label: 'Sistemas', icon: Layers },
    { to: '/catalog/rulesets', label: 'Reglamentos', icon: Shield },
  ]},
  { section: 'Diario', items: [
    { to: '/journal/notes', label: 'Notas', icon: FileText },
    { to: '/journal/physical-sessions', label: 'Físico', icon: Dumbbell },
  ]},
  { section: 'Planificación', items: [
    { to: '/planning/study-plans', label: 'Planes', icon: CalendarDays },
    { to: '/planning/weekly-template', label: 'Plantilla semanal', icon: Grid3X3 },
  ]},
  { section: 'Competición', items: [
    { to: '/competition/logs', label: 'Competencias', icon: Trophy },
  ]},
  { section: 'Cuenta', items: [
    { to: '/profile', label: 'Perfil', icon: User },
    { to: '/export', label: 'Exportar', icon: Download },
  ]},
]

const NAV_MONO = { fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.06em' } as const

export function BottomTabBar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()

  const handleMoreNav = (to: string) => {
    setMoreOpen(false)
    navigate(to)
  }

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMoreOpen(false)} />
      )}

      {moreOpen && (
        <div
          className="fixed bottom-16 left-0 right-0 z-50 bg-background border-t border-border overflow-y-auto"
          style={{ maxHeight: '65vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {MORE_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <p
                className="px-4 pt-3 pb-1 text-muted-foreground uppercase"
                style={NAV_MONO}
              >
                {section}
              </p>
              {items.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => handleMoreNav(to)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors min-h-[48px] border-t border-border/50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-foreground uppercase" style={NAV_MONO}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-end bg-background border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <TabItem to="/" label="Inicio" icon={Home} end />
        <TabItem to="/catalog/techniques" label="Técnicas" icon={BookOpen} />

        {/* FAB placeholder slot */}
        <div className="flex-none w-14" />

        <TabItem to="/journal/training-sessions" label="Sesiones" icon={Calendar} />

        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] min-w-[44px] transition-colors',
            moreOpen ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <Grid3X3 className="h-5 w-5" strokeWidth={1.5} />
          <span className="uppercase" style={NAV_MONO}>Más</span>
        </button>
      </nav>
    </>
  )
}

function TabItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] min-w-[44px] transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )
      }
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      <span className="uppercase" style={NAV_MONO}>{label}</span>
    </NavLink>
  )
}
