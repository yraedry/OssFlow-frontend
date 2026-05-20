import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/utils'
import { useNotifications, useMarkNotificationsRead, COACHING_KEYS } from '../hooks'
import { NOTIFICATION_LABELS } from '../notificationLabels'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifications } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const qc = useQueryClient()
  const [snapshot, setSnapshot] = useState<typeof notifications>(undefined)

  const displayed = open && snapshot !== undefined ? snapshot : notifications
  const unread = notifications?.filter((n) => !n.read).length ?? 0

  function handleOpen() {
    setOpen((prev) => {
      const next = !prev
      if (next) {
        type NotifData = typeof notifications
        const cached = qc.getQueryData<NotifData>(COACHING_KEYS.notifications)
        setSnapshot(cached ?? [])
        if ((cached?.filter(n => !n.read).length ?? 0) > 0) {
          markRead.mutate()
        }
      } else {
        setSnapshot(undefined)
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
        className="flex min-w-[44px] min-h-[44px] items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} ${unread === 1 ? 'nueva' : 'nuevas'})` : ''}`}
      >
        <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-foreground"
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

          {(!displayed || displayed.length === 0) ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {displayed.map((n) => (
                <li key={n.id} className={cn('flex items-start gap-2 px-3 py-2.5', n.read && 'opacity-50')}>
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
                  )}
                  <div className={cn('flex flex-col gap-0.5', n.read && 'pl-3.5')}>
                    <p className="text-xs font-medium">{NOTIFICATION_LABELS[n.type] ?? n.type}</p>
                    <p
                      className="text-xs text-muted-foreground/60"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
