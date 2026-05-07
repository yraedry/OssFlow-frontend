import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import {
  Moon,
  Sun,
  BookOpen,
  Layers,
  Dumbbell,
  Target,
  User,
  FileText,
  Trophy,
  Network,
  Search,
  GitGraph,
  ScrollText,
  Download,
  Trash2,
} from 'lucide-react'
import { CommandPalette } from '@/shared/components/CommandPalette'
import { useProfile } from '@/features/identity/profile/hooks'

const navItems = [
  { to: '/', label: 'Inicio', icon: Target, end: true },
  { to: '/catalog/positions', label: 'Posiciones', icon: Layers },
  { to: '/catalog/techniques', label: 'Técnicas', icon: BookOpen },
  { to: '/catalog/systems', label: 'Sistemas', icon: Network },
  { to: '/catalog/rulesets', label: 'Reglamentos', icon: ScrollText },
  { to: '/journal/notes', label: 'Notas', icon: FileText },
  { to: '/journal/graph', label: 'Grafo de notas', icon: GitGraph },
  { to: '/journal/training-sessions', label: 'Sesiones', icon: Dumbbell },
  { to: '/planning/study-plans', label: 'Planes', icon: BookOpen },
  { to: '/competition/logs', label: 'Competencias', icon: Trophy },
  { to: '/profile', label: 'Perfil', icon: User },
  { to: '/export', label: 'Exportar', icon: Download },
  { to: '/trash', label: 'Papelera', icon: Trash2 },
]

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()
  const [cmdOpen, setCmdOpen] = useState(false)
  const { data: profile } = useProfile()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="block">
            <span
              style={{ fontFamily: 'var(--font-serif)' }}
              className="text-xl font-bold tracking-tight text-foreground"
            >
              OssFlow
            </span>
          </Link>
          {profile && (
            <p
              className="text-xs mt-1 truncate"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', color: 'var(--color-muted-foreground)' }}
            >
              {profile.displayName}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-1">
          <button
            onClick={() => setCmdOpen(true)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Buscar...
            </span>
            <kbd
              className="border border-border px-1.5 py-0.5 text-[10px]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ⌘K
            </kbd>
          </button>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}
