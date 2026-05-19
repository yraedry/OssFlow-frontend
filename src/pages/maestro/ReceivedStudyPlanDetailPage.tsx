import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, BookOpen, Type } from 'lucide-react'
import { useReceivedStudyPlan } from '@/features/coaching/studyplan/hooks'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyBlock } from '@/features/coaching/studyplan/types'

function BlockView({ block, index }: { block: StudyBlock; index: number }) {
  return (
    <div className="border border-border bg-card p-4 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Bloque {index + 1}{block.title ? ` · ${block.title}` : ''}
      </p>
      <div className="space-y-1.5">
        {(block.items ?? []).map(item => (
          <div key={item.id} className="flex items-start gap-2.5 text-sm py-1">
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
          <p className="text-xs text-muted-foreground/50 italic">Sin items</p>
        )}
      </div>
    </div>
  )
}

export function ReceivedStudyPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const id = Number(planId)
  const { data: plan, isLoading } = useReceivedStudyPlan(id)

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>
  if (!plan) return null

  return (
    <div className="space-y-4 max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/maestro/planificacion')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wide"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver a planificación
      </button>

      <div className="border border-border bg-card px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Plan de estudio</p>
        <h1 className="font-serif text-xl font-black leading-tight">{plan.title}</h1>
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
        )}
        <p className="font-mono text-[10px] text-muted-foreground/50 mt-3">
          {new Date(plan.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {(plan.blocks ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground italic px-1">Este plan no tiene bloques todavía.</p>
      ) : (
        <div className="space-y-3">
          {(plan.blocks ?? []).map((block, i) => (
            <BlockView key={block.id} block={block} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
