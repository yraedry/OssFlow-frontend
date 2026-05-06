import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import { Moon, Sun, BookOpen, Layers, Dumbbell, Target, User, FileText, Trophy } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

const navItems = [
  { to: '/', label: 'Inicio', icon: Target, end: true },
  { to: '/catalog/positions', label: 'Posiciones', icon: Layers },
  { to: '/catalog/techniques', label: 'Técnicas', icon: BookOpen },
  { to: '/journal/notes', label: 'Notas', icon: FileText },
  { to: '/journal/training-sessions', label: 'Sesiones', icon: Dumbbell },
  { to: '/planning/study-plans', label: 'Planes', icon: BookOpen },
  { to: '/competition/logs', label: 'Competencias', icon: Trophy },
  { to: '/profile', label: 'Perfil', icon: User },
]

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">OssFlow</h1>
          <p className="text-xs text-muted-foreground">BJJ Knowledge System</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start gap-2">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
