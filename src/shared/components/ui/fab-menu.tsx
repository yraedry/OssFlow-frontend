// src/shared/components/ui/fab-menu.tsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, X, Dumbbell, Zap, BookOpen, FileText, CalendarPlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const ACTIONS = [
  { label: 'Sesión BJJ', icon: Dumbbell, to: '/diario/sesiones-bjj?new=bjj' },
  { label: 'Sesión física', icon: Zap, to: '/diario/sesiones-fisicas?new=1' },
  { label: 'Técnica', icon: BookOpen, to: '/estudio/tecnicas?new=1' },
  { label: 'Nota', icon: FileText, to: '/diario/notas?new=1' },
  { label: 'Programar', icon: CalendarPlus, to: '/planificacion/planes?new=1' },
] as const

const SUB_PATHS = ['/diario', '/estudio', '/planificacion', '/journal', '/competition', '/catalog', '/physical', '/planning']

export function FabMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const hasSubNav = SUB_PATHS.some(p => pathname.startsWith(p))
  const fabBottom = hasSubNav
    ? 'calc(env(safe-area-inset-bottom, 0px) + 96px)'
    : 'calc(env(safe-area-inset-bottom, 0px) + 64px)'
  const menuBottom = hasSubNav
    ? 'calc(env(safe-area-inset-bottom, 0px) + 112px)'
    : 'calc(env(safe-area-inset-bottom, 0px) + 80px)'

  const handleAction = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          className="fixed right-4 z-50 w-56 border border-border bg-background"
          style={{ fontFamily: 'var(--font-mono)', bottom: menuBottom }}
        >
          {ACTIONS.map(({ label, icon: Icon, to }) => (
            <button
              key={to}
              onClick={() => handleAction(to)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-foreground hover:bg-accent transition-colors min-h-[48px] last:border-b-0"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-widest">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div
        className="fixed right-4 z-50"
        style={{ bottom: fabBottom }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Añadir'}
          className={cn(
            'flex h-11 w-11 items-center justify-center border-[3px] border-background rounded-full transition-transform duration-150',
            open ? 'bg-foreground scale-95' : 'bg-foreground scale-100',
          )}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          {open ? (
            <X className="h-5 w-5 text-background" strokeWidth={2.5} />
          ) : (
            <Plus className="h-5 w-5 text-background" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  )
}
