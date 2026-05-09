import { format, differenceInDays, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, BookOpen, CalendarRange } from 'lucide-react'
import type { StudyPlan } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

type StudyPlanCardProps = {
  plan: StudyPlan
  onClick: (plan: StudyPlan) => void
  onDelete: (id: number) => void
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'd MMM', { locale: es })
}

function getPlanStatus(plan: StudyPlan): { label: string; color: string } {
  if (!plan.endDate) return { label: 'En curso', color: '#10b981' }
  const end = new Date(plan.endDate)
  if (isPast(end)) return { label: 'Completado', color: '#6b7280' }
  const daysLeft = differenceInDays(end, new Date())
  if (daysLeft <= 7) return { label: `${daysLeft}d restantes`, color: '#f59e0b' }
  return { label: `${daysLeft}d restantes`, color: '#10b981' }
}

export function StudyPlanCard({ plan, onClick, onDelete }: StudyPlanCardProps) {
  const status = getPlanStatus(plan)

  return (
    <div
      className="group relative border border-border bg-card hover:border-foreground transition-colors cursor-pointer"
      onClick={() => onClick(plan)}
      style={{ borderLeft: `3px solid ${status.color}` }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 shrink-0" style={{ color: status.color }} strokeWidth={1.5} />
            <h3 className="font-bold leading-tight" style={{ ...SERIF, fontSize: '15px' }}>{plan.title}</h3>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(plan.id) }}
            className="shrink-0 p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            aria-label="Eliminar plan"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {plan.goalMarkdown && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3" style={MONO}>{plan.goalMarkdown}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          {(plan.startDate || plan.endDate) ? (
            <div className="flex items-center gap-1.5" style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>
              <CalendarRange className="h-3 w-3" strokeWidth={1.5} />
              {plan.startDate && <span>{formatDate(plan.startDate)}</span>}
              {plan.endDate && <span>→ {formatDate(plan.endDate)}</span>}
            </div>
          ) : (
            <span />
          )}
          <span style={{ ...LABEL, color: status.color }}>{status.label}</span>
        </div>
      </div>
    </div>
  )
}
