import { Spinner } from '@/shared/components/ui/spinner'
import { cn } from '@/shared/lib/utils'
import { useAthletes } from '../hooks'

type Props = { onSelectAthlete: (id: number) => void }

const BELT_COLOR: Record<string, string> = {
  white:  'bg-gray-200',
  blue:   'bg-blue-500',
  purple: 'bg-purple-600',
  brown:  'bg-amber-800',
  black:  'bg-gray-900 border border-gray-600',
}

function getBeltColor(belt: string): string {
  const normalized = belt.toLowerCase()
  for (const [key, value] of Object.entries(BELT_COLOR)) {
    if (normalized.includes(key)) return value
  }
  return 'bg-gray-400'
}

export function AthleteRoster({ onSelectAthlete }: Props) {
  const { data: athletes, isLoading } = useAthletes()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <span className="text-3xl">🥋</span>
        <p className="text-sm">Aún no tienes alumnos vinculados</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {athletes.map((athlete) => (
        <li key={athlete.athleteId}>
          <button
            type="button"
            onClick={() => onSelectAthlete(athlete.athleteId)}
            className="w-full flex items-center gap-3 py-3 px-0 hover:bg-accent/50 transition-colors text-left"
          >
            <span
              className={cn('h-8 w-1.5 shrink-0', getBeltColor(athlete.currentBelt))}
              aria-label={`Cinturón ${athlete.currentBelt}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{athlete.displayName}</p>
              <p
                className="text-xs text-muted-foreground capitalize"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {athlete.currentBelt}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
