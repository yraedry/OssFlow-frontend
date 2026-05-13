import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/shared/lib/utils'
import { useNotifications, useMarkNotificationsRead } from '../hooks'
import type { CoachingNotification } from '../types'

const NOTIFICATION_LABELS: Record<CoachingNotification['type'], string> = {
  ATHLETE_JOINED:    '🥋 Nuevo alumno',
  ATHLETE_LEFT:      'Alumno desvinculado',
  COACH_REMOVED_YOU: 'Desvinculado de maestro',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifications } = useNotifications()
  const markRead = useMarkNotificationsRead()

  const unread = notifications?.length ?? 0

  function handleOpen() {
    setOpen((prev) => {
      const next = !prev
      if (next && unread > 0) {
        markRead.mutate()
      }
      return next
    })
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} nuevas)` : ''}`}
      >
        <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-1 z-50',
            'w-72 bg-background border border-border shadow-lg',
          )}
        >
          <div className="px-3 py-2 border-b border-border">
            <p
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Notificaciones
            </p>
          </div>

          {(!notifications || notifications.length === 0) ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id} className="flex flex-col gap-0.5 px-3 py-2.5">
                  <p className="text-xs font-medium">{NOTIFICATION_LABELS[n.type]}</p>
                  {n.payload && (
                    <p className="text-xs text-muted-foreground">{n.payload}</p>
                  )}
                  <p
                    className="text-xs text-muted-foreground/60"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
