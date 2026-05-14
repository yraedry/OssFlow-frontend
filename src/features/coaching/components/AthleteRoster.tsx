import { Spinner } from '@/shared/components/ui/spinner'
import { cn } from '@/shared/lib/utils'
import { useAthletes } from '../hooks'

type Props = { onSelectAthlete: (id: number) => void }

const BELT_COLORS: Record<string, { bar: string; label: string }> = {
  white:  { bar: 'bg-[#e8e4dc]',         label: 'BLANCO' },
  blue:   { bar: 'bg-[#2563eb]',         label: 'AZUL' },
  purple: { bar: 'bg-[#7c3aed]',         label: 'PÚRPURA' },
  brown:  { bar: 'bg-[#92400e]',         label: 'MARRÓN' },
  black:  { bar: 'bg-[#1a1a1a] border border-[#555]', label: 'NEGRO' },
}

function getBelt(belt: string) {
  const norm = belt.toLowerCase()
  for (const [key, val] of Object.entries(BELT_COLORS)) {
    if (norm.includes(key)) return val
  }
  return { bar: 'bg-muted', label: belt.toUpperCase() }
}

export function AthleteRoster({ onSelectAthlete }: Props) {
  const { data: athletes, isLoading } = useAthletes()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (!athletes || athletes.length === 0) {
    return (
      <div className="border border-dashed border-border/50 px-6 py-10 flex flex-col items-center gap-2 text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Sin alumnos vinculados
        </p>
        <p className="text-xs text-muted-foreground/60" style={{ fontFamily: 'var(--font-mono)' }}>
          Genera un código en Configuración y compártelo con tus atletas.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border/60 divide-y divide-border/40">
      {athletes.map((athlete) => {
        const belt = getBelt(athlete.currentBelt)
        return (
          <button
            key={athlete.athleteId}
            type="button"
            onClick={() => onSelectAthlete(athlete.athleteId)}
            className="w-full flex items-center gap-0 text-left hover:bg-foreground/[0.03] transition-colors group"
          >
            {/* Belt bar */}
            <span className={cn('h-full w-1 self-stretch shrink-0 min-h-[52px]', belt.bar)} aria-hidden="true" />

            {/* Info */}
            <div className="flex-1 min-w-0 px-4 py-3">
              <p className="text-sm font-semibold truncate group-hover:text-foreground transition-colors">
                {athlete.displayName}
              </p>
              <p
                className="text-[10px] text-muted-foreground tracking-widest mt-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {belt.label}
              </p>
            </div>

            {/* Chevron */}
            <span className="pr-4 text-muted-foreground/40 group-hover:text-muted-foreground text-xs transition-colors">›</span>
          </button>
        )
      })}
    </div>
  )
}
