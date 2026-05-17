import { useState } from 'react'
import { Plus, FileText, Eye } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCoachStudyPlans, useCreateStudyPlan, useDeleteStudyPlan } from './hooks'
import { StudyPlanEditor } from './StudyPlanEditor'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyPlan } from './types'

interface Props {
  athleteId: number
}

export function CoachStudyPlanTab({ athleteId }: Props) {
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const confirm = useConfirm()

  const { data: plans, isLoading } = useCoachStudyPlans(athleteId)
  const create = useCreateStudyPlan(athleteId)
  const deletePlan = useDeleteStudyPlan(athleteId)

  if (editingPlanId) {
    return (
      <StudyPlanEditor
        planId={editingPlanId}
        athleteId={athleteId}
        onBack={() => setEditingPlanId(null)}
      />
    )
  }

  async function handleCreate() {
    if (!newTitle.trim()) return
    const plan = await create.mutateAsync(newTitle.trim())
    setNewTitle('')
    setCreating(false)
    setEditingPlanId(plan.id)
  }

  async function handleDelete(plan: StudyPlan) {
    const ok = await confirm({ description: `¿Eliminar el plan "${plan.title}"?` })
    if (!ok) return
    deletePlan.mutate(plan.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Planes de estudio
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          <Plus className="h-3 w-3" strokeWidth={1.5} />
          Nuevo plan
        </button>
      </div>

      {creating && (
        <div className="flex gap-2 border border-border p-3 bg-card">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewTitle('') } }}
            placeholder="Título del plan..."
            className="flex-1 bg-transparent text-sm border-b border-border outline-none pb-1 placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newTitle.trim() || create.isPending}
            className="px-3 py-1 text-xs bg-foreground text-background disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          >
            {create.isPending ? <Spinner /> : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setNewTitle('') }}
            className="px-2 py-1 text-xs border border-border text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : !plans?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">No hay planes de estudio todavía.</p>
          <p className="text-xs mt-1">Crea el primero con el botón "Nuevo plan".</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditingPlanId(plan.id)}
              onDelete={() => handleDelete(plan)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PlanCard({ plan, onEdit, onDelete }: { plan: StudyPlan; onEdit: () => void; onDelete: () => void }) {
  const isDraft = plan.status === 'DRAFT'

  return (
    <div
      className="group flex items-center gap-3 border border-border bg-card px-4 py-3 cursor-pointer hover:border-foreground/40 transition-colors"
      onClick={onEdit}
    >
      <FileText className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{plan.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-mono uppercase tracking-widest ${isDraft ? 'text-muted-foreground' : 'text-emerald-500'}`}>
            {isDraft ? 'Borrador' : 'Publicado'}
          </span>
          {!isDraft && plan.viewedByAthlete && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Eye className="h-2.5 w-2.5" strokeWidth={1.5} />
              Visto
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(plan.createdAt), 'd MMM yyyy', { locale: es })}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {plan.blocks.length} {plan.blocks.length === 1 ? 'bloque' : 'bloques'}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
      >
        ✕
      </button>
    </div>
  )
}
