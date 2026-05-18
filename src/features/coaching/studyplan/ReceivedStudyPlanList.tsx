import { useState } from 'react'
import { FileText, BookOpen, Type, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReceivedStudyPlans } from './hooks'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyPlan, StudyBlock } from './types'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
      {plans.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}

function PlanCard({ plan }: { plan: StudyPlan }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-border bg-card">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{plan.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {format(new Date(plan.createdAt), 'd MMM yyyy', { locale: es })}
            {plan.description && ` · ${plan.description.slice(0, 60)}${plan.description.length > 60 ? '…' : ''}`}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        }
      </button>

      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 space-y-3">
          {plan.description && (
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          )}
          {(plan.blocks ?? []).map((block, i) => (
            <BlockView key={block.id} block={block} index={i} />
          ))}
          {!plan.blocks?.length && (
            <p className="text-sm text-muted-foreground italic">Este plan no tiene bloques todavía.</p>
          )}
        </div>
      )}
    </div>
  )
}

function BlockView({ block, index }: { block: StudyBlock; index: number }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        Bloque {index + 1}{block.title ? ` · ${block.title}` : ''}
      </p>
      <div className="space-y-1 ml-2">
        {(block.items ?? []).map(item => (
          <div key={item.id} className="flex items-start gap-2 text-sm py-1">
            {item.itemType === 'TECHNIQUE' ? (
              <BookOpen className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" strokeWidth={1.5} />
            ) : (
              <Type className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0" strokeWidth={1.5} />
            )}
            <span className={item.itemType === 'TECHNIQUE' ? 'font-medium' : 'whitespace-pre-wrap text-muted-foreground'}>
              {item.itemType === 'TECHNIQUE' ? item.techniqueName : item.content}
            </span>
          </div>
        ))}
        {!block.items?.length && (
          <p className="text-xs text-muted-foreground/70 italic">Sin items</p>
        )}
      </div>
    </div>
  )
}
