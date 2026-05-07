// src/shared/components/layout/BottomTabBar.tsx
import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Calendar, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const tabs = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/catalog/techniques', label: 'Técnicas', icon: BookOpen },
  { to: '/journal/training-sessions', label: 'Sesiones', icon: Calendar },
  { to: '/profile', label: 'Perfil', icon: User },
] as const

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.slice(0, 2).map(({ to, label, icon: Icon, end }) => (
        <TabItem key={to} to={to} label={label} icon={Icon} end={end} />
      ))}

      {/* FAB placeholder slot — filled by AppLayout */}
      <div className="flex-none w-14" />

      {tabs.slice(2).map(({ to, label, icon: Icon }) => (
        <TabItem key={to} to={to} label={label} icon={Icon} />
      ))}
    </nav>
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
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[44px] min-w-[44px]',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )
      }
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      <span
        style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '0.06em' }}
        className="uppercase"
      >
        {label}
      </span>
    </NavLink>
  )
}
