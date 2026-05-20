import { useNavigate } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReceivedStudyPlans } from './hooks'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyPlan } from './types'

export function ReceivedStudyPlanList() {
  const { data: plans, isLoading } = useReceivedStudyPlans()

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>

  if (!plans?.length) {
    return (
      <div className="border border-dashed border-border px-6 py-10 text-center">
        <p className="font-serif text-base text-muted-foreground italic">Sin planes de estudio aún</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">
          Tu maestro aún no te ha enviado ningún plan
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {plans.map((plan, i) => (
        <PlanCard key={plan.id} plan={plan} index={i} />
      ))}
    </div>
  )
}

function PlanCard({ plan, index }: { plan: StudyPlan; index: number }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/maestro/planificacion/${plan.id}`)}
      className="w-full text-left group transition-colors hover:bg-muted/30 cursor-pointer bg-transparent border-none p-0"
    >
      <div className="flex border border-border">
        <div className="w-12 shrink-0 flex items-start justify-end px-3 pt-4 border-r border-border bg-muted/10">
          <span className="font-mono text-[9px] text-muted-foreground/40">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="flex-1 min-w-0 px-4 py-3.5 flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{plan.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              {format(new Date(plan.createdAt), 'd MMM yyyy', { locale: es })}
              {plan.blocks?.length ? ` · ${plan.blocks.length} bloque${plan.blocks.length !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>
        <div className="w-8 shrink-0 flex items-center justify-center border-l border-border">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors" strokeWidth={1.5} />
        </div>
      </div>
    </button>
  )
}
