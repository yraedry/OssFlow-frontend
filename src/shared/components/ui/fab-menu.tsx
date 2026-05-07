// src/shared/components/ui/fab-menu.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Dumbbell, Zap, BookOpen, FileText, CalendarPlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const ACTIONS = [
  { label: 'Sesión BJJ', icon: Dumbbell, to: '/journal/training-sessions?new=bjj' },
  { label: 'Sesión física', icon: Zap, to: '/journal/physical-sessions?new=1' },
  { label: 'Técnica', icon: BookOpen, to: '/catalog/techniques?new=1' },
  { label: 'Nota', icon: FileText, to: '/journal/notes?new=1' },
  { label: 'Programar', icon: CalendarPlus, to: '/planning/study-plans?new=1' },
] as const

export function FabMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

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
          className="fixed bottom-20 left-0 right-0 z-50 mx-4 border border-border bg-background"
          style={{ fontFamily: 'var(--font-mono)' }}
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
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-end pb-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Añadir'}
          className={cn(
            'flex h-11 w-11 items-center justify-center border-[3px] border-background rounded-full transition-transform duration-150',
            open ? 'bg-foreground scale-95' : 'bg-foreground scale-100',
          )}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)', marginBottom: '2px' }}
        >
          {open ? (
            <X className="h-5 w-5 text-background" strokeWidth={2.5} />
          ) : (
            <Plus className="h-5 w-5 text-background" strokeWidth={2.5} />
          )}
        </button>
        <span
          style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '0.06em' }}
          className="uppercase text-muted-foreground"
        >
          Añadir
        </span>
      </div>
    </>
  )
}
