import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useAthleteSummary } from '../hooks'

type Props = { athleteId: number | null; onClose: () => void }

const BELT_COLOR: Record<string, string> = {
  white:  'bg-gray-200 text-gray-900',
  blue:   'bg-blue-500 text-white',
  purple: 'bg-purple-600 text-white',
  brown:  'bg-amber-800 text-white',
  black:  'bg-gray-900 text-white border border-gray-600',
}

function getBeltColor(belt: string): string {
  const normalized = belt.toLowerCase()
  for (const [key, value] of Object.entries(BELT_COLOR)) {
    if (normalized.includes(key)) return value
  }
  return 'bg-gray-400 text-white'
}

function ActivityBadge({ days }: { days: number }) {
  const color =
    days <= 3 ? 'bg-green-500' :
    days <= 7 ? 'bg-yellow-500' :
    'bg-red-500'
  const label =
    days <= 3 ? 'Al día' :
    days <= 7 ? 'Inactivo' :
    'Sin entrenar'
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs text-white', color)}>
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {label} · {days}d
    </span>
  )
}

export function AthleteSummaryDrawer({ athleteId, onClose }: Props) {
  const { data: summary, isLoading } = useAthleteSummary(athleteId)

  const isOpen = athleteId !== null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:bg-black/20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-background border-l border-border flex flex-col',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="Resumen del atleta"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Resumen del atleta
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          )}

          {summary && (
            <>
              {/* Header info */}
              <div className="space-y-2">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
                  {summary.displayName}
                </h2>
                {summary.academy && (
                  <p className="text-xs text-muted-foreground">{summary.academy}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-semibold capitalize',
                      getBeltColor(summary.currentBelt),
                    )}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {summary.currentBelt}
                  </span>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    {summary.daysInBelt}d en el cinturón
                  </span>
                </div>
              </div>

              {/* Activity */}
              <div className="space-y-1.5">
                <p
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Actividad
                </p>
                <ActivityBadge days={summary.daysSinceLastSession} />
                {summary.lastSessionDate && (
                  <p className="text-xs text-muted-foreground">
                    Última sesión: {new Date(summary.lastSessionDate).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>

              {/* Injuries */}
              {summary.activeInjuries.length > 0 && (
                <div className="space-y-1.5">
                  <p
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Lesiones activas
                  </p>
                  <ul className="space-y-1">
                    {summary.activeInjuries.map((injury, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>{injury.bodyPart}</span>
                        <span className="text-muted-foreground capitalize">— {injury.severity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent competitions */}
              {summary.recentCompetitions.length > 0 && (
                <div className="space-y-1.5">
                  <p
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Últimas competiciones
                  </p>
                  <ul className="space-y-2">
                    {summary.recentCompetitions.map((comp, i) => (
                      <li key={i} className="text-xs">
                        <p className="font-medium">{comp.name}</p>
                        <p className="text-muted-foreground">
                          {new Date(comp.date).toLocaleDateString('es-ES')}
                          {comp.result && ` · ${comp.result}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
