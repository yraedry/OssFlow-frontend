import { Spinner } from '@/shared/components/ui/spinner'
import { cn } from '@/shared/lib/utils'
import { useAthletes } from '../hooks'
import { ChevronRight, Activity } from 'lucide-react'

type Props = { onSelectAthlete: (id: number) => void }

const BELT_CONFIG: Record<string, { bg: string; text: string; label: string; bar: string }> = {
  white:  { bg: 'bg-[#e8e4dc]',   text: 'text-[#1a1a1a]', label: 'BLANCO',  bar: 'bg-[#e8e4dc]' },
  blue:   { bg: 'bg-[#2563eb]',   text: 'text-white',      label: 'AZUL',    bar: 'bg-[#2563eb]' },
  purple: { bg: 'bg-[#7c3aed]',   text: 'text-white',      label: 'PÚRPURA', bar: 'bg-[#7c3aed]' },
  brown:  { bg: 'bg-[#92400e]',   text: 'text-white',      label: 'MARRÓN',  bar: 'bg-[#92400e]' },
  black:  { bg: 'bg-[#1a1a1a]',   text: 'text-[#f0ebe3]',  label: 'NEGRO',   bar: 'bg-[#1a1a1a]' },
}

function getBelt(belt: string) {
  const norm = belt.toLowerCase()
  for (const [key, val] of Object.entries(BELT_CONFIG)) {
    if (norm.includes(key)) return val
  }
  return { bg: 'bg-muted', text: 'text-foreground', label: belt.toUpperCase(), bar: 'bg-muted' }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
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
      <div className="border border-dashed border-border/50 px-6 py-12 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 border border-dashed border-border flex items-center justify-center">
          <Activity className="h-5 w-5 text-muted-foreground/30" strokeWidth={1.5} />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">
          Sin alumnos vinculados
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono max-w-[240px]">
          Genera un código en Configuración y compártelo con tus atletas.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {athletes.map((athlete) => {
        const belt = getBelt(athlete.currentBelt)
        const ini = initials(athlete.displayName)
        return (
          <button
            key={athlete.athleteId}
            type="button"
            onClick={() => onSelectAthlete(athlete.athleteId)}
            className="group flex items-stretch gap-0 text-left border border-border hover:border-foreground/30 hover:bg-foreground/[0.02] transition-all duration-150 cursor-pointer"
          >
            {/* Belt accent bar */}
            <span className={cn('w-1 shrink-0', belt.bar)} aria-hidden="true" />

            {/* Avatar + info */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2.5">
              {/* Avatar */}
              <div className={cn('h-8 w-8 shrink-0 flex items-center justify-center text-xs font-black', belt.bg, belt.text)}
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {ini}
              </div>

              {/* Name + belt */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate group-hover:text-foreground transition-colors leading-snug">
                  {athlete.displayName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn('text-[9px] font-bold px-1.5 py-px tracking-widest uppercase', belt.bg, belt.text)}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {belt.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center pr-2.5">
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
                strokeWidth={1.5}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
