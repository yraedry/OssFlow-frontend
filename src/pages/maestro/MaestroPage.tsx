import { Link, Outlet } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useNoteUnreadCount, useRecommendationsReceived } from '@/features/coaching/hooks'

export function MaestroPage() {
  const { data: unreadCount } = useNoteUnreadCount()
  const count = unreadCount ?? 0
  const { data: receivedRecommendations } = useRecommendationsReceived()
  const pendingRecs = receivedRecommendations?.filter(r => r.status === 'PENDING').length ?? 0

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Área del atleta
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Coaching
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {count > 0 && (
            <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide border border-foreground px-2.5 py-1 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground inline-block" />
              {count} {count === 1 ? 'nota nueva' : 'notas nuevas'}
            </span>
          )}
          {pendingRecs > 0 && (
            <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide border border-border px-2.5 py-1 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
              {pendingRecs} recom.
            </span>
          )}
          <Link
            to="/configuracion#mis-maestros"
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Gestionar maestros</span>
          </Link>
        </div>
      </div>

      <Outlet />
    </div>
  )
}
