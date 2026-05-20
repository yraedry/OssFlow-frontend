import { Spinner } from '@/shared/components/ui/spinner'
import { useCoaches, useLeaveCoach } from '../hooks'

const MONO = { fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' } as const

export function MyCoachesList() {
  const leaveCoach = useLeaveCoach()
  const { data: coaches, isLoading } = useCoaches()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!coaches || coaches.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-8 text-center">
        <p className="font-serif text-base text-muted-foreground/60 italic">
          Sin maestros vinculados todavía
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-2">
          Ve a Configuración para vincular un maestro
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border border border-border">
      {coaches.map((coach, i) => (
        <div key={coach.coachId} className="flex items-center gap-5 px-5 py-4 group">

          {/* Index + initial */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[9px] text-muted-foreground/40 w-4 text-right">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="h-10 w-10 border border-border flex items-center justify-center bg-muted/20">
              <span className="font-serif text-lg font-bold text-foreground/70 uppercase">
                {coach.displayName.charAt(0)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[15px] font-bold text-foreground leading-tight">
              {coach.displayName}
            </p>
            {coach.academy && (
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                {coach.academy}
              </p>
            )}
          </div>

          {/* Unlink */}
          <button
            type="button"
            onClick={() => leaveCoach.mutate(coach.coachId)}
            className="shrink-0 px-3 py-1.5 border border-border/50 font-mono text-[9px] uppercase tracking-wide text-muted-foreground/50 hover:border-destructive hover:text-destructive transition-all cursor-pointer bg-transparent"
            style={MONO}
          >
            Desvincular
          </button>
        </div>
      ))}
    </div>
  )
}
