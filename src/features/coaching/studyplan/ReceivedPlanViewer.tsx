import { BookOpen, Type, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studyPlanApi } from './api'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyBlock, StudyItem } from './types'

interface Props {
  planId: number
  onBack: () => void
}

export function ReceivedPlanViewer({ planId, onBack }: Props) {
  const { data: plan, isLoading } = useQuery({
    queryKey: ['study-plan-received', planId],
    queryFn: () => studyPlanApi.getReceived(planId),
    staleTime: 60_000,
  })

  if (isLoading || !plan) {
    return <div className="py-8 flex justify-center"><Spinner /></div>
  }

  const isDraft = plan.status === 'DRAFT'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold leading-tight">{plan.title}</h2>
          {plan.description && (
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
          )}
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border shrink-0 ${
          isDraft ? 'border-muted-foreground/30 text-muted-foreground' : 'border-emerald-500/50 text-emerald-500'
        }`}>
          {isDraft ? 'Borrador' : 'Publicado'}
        </span>
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {(plan.blocks ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center">Este plan no tiene bloques todavía.</p>
        )}
        {(plan.blocks ?? []).map((block, i) => (
          <BlockViewer key={block.id} block={block} index={i} />
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono uppercase tracking-wide"
      >
        ← Volver a la lista
      </button>
    </div>
  )
}

function BlockViewer({ block, index }: { block: StudyBlock; index: number }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-border bg-card">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-1">#{index + 1}</span>
        <span className="flex-1 text-sm font-semibold truncate">
          {block.title || <span className="italic text-muted-foreground/50">Bloque sin título</span>}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
        }
      </button>

      {open && (
        <div className="p-3 space-y-1.5">
          {(block.items ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground/50 italic">Sin items</p>
          )}
          {(block.items ?? []).map((item, i) => (
            <ItemView key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemView({ item, index }: { item: StudyItem; index: number }) {
  return (
    <div className="flex items-start gap-2 p-2 border border-border/40 bg-background">
      <span className="text-[10px] font-mono text-muted-foreground/50 mt-0.5 shrink-0 w-4">{index + 1}</span>
      {item.itemType === 'TECHNIQUE' ? (
        <BookOpen className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" strokeWidth={1.5} />
      ) : (
        <Type className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" strokeWidth={1.5} />
      )}
      <span className="flex-1 text-sm min-w-0">
        {item.itemType === 'TECHNIQUE' ? (
          <span className="font-medium">{item.techniqueName}</span>
        ) : (
          <span className="whitespace-pre-wrap text-muted-foreground">{item.content}</span>
        )}
      </span>
    </div>
  )
}
