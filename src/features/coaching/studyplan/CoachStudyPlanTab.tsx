import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useCoachStudyPlans, useCreateStudyPlan, useDeleteStudyPlan, useDuplicatePlan } from './hooks'
import { useAthletes } from '@/features/coaching/hooks'
import { StudyPlanEditor } from './StudyPlanEditor'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyPlan } from './types'
import type { CoachAthleteListItem } from '@/features/coaching/types'

interface Props {
  athleteId: number
}

export function CoachStudyPlanTab({ athleteId }: Props) {
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [copyModalPlanId, setCopyModalPlanId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    try {
      return (localStorage.getItem('studyplan-view') as 'cards' | 'table') ?? 'cards'
    } catch {
      return 'cards'
    }
  })
  const confirm = useConfirm()

  const { data: plans, isLoading } = useCoachStudyPlans(athleteId)
  const { data: athletes } = useAthletes()
  const create = useCreateStudyPlan(athleteId)
  const deletePlan = useDeleteStudyPlan(athleteId)
  const duplicatePlan = useDuplicatePlan(athleteId)

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

  function toggleView() {
    const next = viewMode === 'cards' ? 'table' : 'cards'
    setViewMode(next)
    try {
      localStorage.setItem('studyplan-view', next)
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Planes de estudio
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleView}
            className="font-mono text-[10px] uppercase tracking-[0.06em] border border-border px-3 py-1.5 bg-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {viewMode === 'cards' ? '≡ Tabla' : '⊞ Tarjetas'}
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] border border-foreground px-3 py-1.5 bg-foreground text-background hover:bg-foreground/85 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" strokeWidth={1.5} />
            Nuevo plan
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div className="flex gap-2 border border-border p-3 bg-card">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setCreating(false); setNewTitle('') }
            }}
            placeholder="Título del plan..."
            className="flex-1 bg-transparent text-foreground text-sm border-none border-b border-border outline-none pb-1 font-mono placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newTitle.trim() || create.isPending}
            className="px-3 py-1 font-mono text-[10px] uppercase bg-foreground text-background border-none cursor-pointer disabled:opacity-50 transition-opacity"
          >
            {create.isPending ? <Spinner /> : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setNewTitle('') }}
            className="px-2 py-1 font-mono text-[10px] border border-border bg-transparent text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Plan list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : viewMode === 'table' ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {['Título', 'Estado', 'Fecha', 'Bloques', ''].map(h => (
                <th
                  key={h}
                  className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground/60 px-4 py-1.5 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(plans ?? []).map(plan => (
              <TableRow
                key={plan.id}
                plan={plan}
                onEdit={() => setEditingPlanId(plan.id)}
                onDelete={() => handleDelete(plan)}
                onDuplicate={() => duplicatePlan.mutate({ planId: plan.id, targetAthleteId: athleteId })}
                onCopyToAthlete={() => setCopyModalPlanId(plan.id)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-border">
          {(plans ?? []).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditingPlanId(plan.id)}
              onDelete={() => handleDelete(plan)}
              onDuplicate={() => duplicatePlan.mutate({ planId: plan.id, targetAthleteId: athleteId })}
              onCopyToAthlete={() => setCopyModalPlanId(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Copy to athlete modal */}
      {copyModalPlanId !== null && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          onClick={() => setCopyModalPlanId(null)}
        >
          <div
            className="bg-card border border-border p-6 min-w-[300px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground mb-4">
              Copiar a atleta
            </div>
            {(athletes as CoachAthleteListItem[] | undefined)?.filter(a => a.athleteId !== athleteId).map(a => (
              <button
                key={a.athleteId}
                onClick={() => {
                  duplicatePlan.mutate({ planId: copyModalPlanId, targetAthleteId: a.athleteId })
                  setCopyModalPlanId(null)
                }}
                className="block w-full px-4 py-2.5 bg-transparent border-none border-b border-border cursor-pointer text-left text-foreground font-sans text-sm hover:bg-muted/50 transition-colors"
              >
                {a.displayName}
              </button>
            ))}
            {(athletes as CoachAthleteListItem[] | undefined)?.filter(a => a.athleteId !== athleteId).length === 0 && (
              <div className="font-mono text-[11px] text-muted-foreground/60 py-2">
                No hay otros atletas vinculados
              </div>
            )}
            <button
              onClick={() => setCopyModalPlanId(null)}
              className="mt-3 font-mono text-[10px] text-muted-foreground/60 bg-transparent border-none cursor-pointer hover:text-muted-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface TableRowProps {
  plan: StudyPlan
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onCopyToAthlete: () => void
}

function TableRow({ plan, onEdit, onDelete, onDuplicate, onCopyToAthlete }: TableRowProps) {
  const [hovered, setHovered] = useState(false)
  const [dupHovered, setDupHovered] = useState(false)
  const [copyHovered, setCopyHovered] = useState(false)
  const [delHovered, setDelHovered] = useState(false)

  return (
    <tr
      onClick={onEdit}
      className={cn('border-b border-border cursor-pointer transition-colors', hovered ? 'bg-muted/50' : 'bg-transparent')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="font-sans text-[13px] text-foreground px-4 py-2.5 font-medium">{plan.title}</td>
      <td
        className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-4 py-2.5"
        style={{ color: plan.status === 'PUBLISHED' ? '#22c55e' : undefined }}
      >
        <span className={plan.status === 'PUBLISHED' ? '' : 'text-muted-foreground/60'}>
          {plan.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
        </span>
      </td>
      <td className="font-mono text-[11px] text-muted-foreground px-4 py-2.5">
        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
      </td>
      <td className="font-mono text-[11px] text-muted-foreground px-4 py-2.5">
        {(plan.blocks ?? []).length}
      </td>
      <td className="px-4 py-2.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
        <button
          title="Duplicar"
          onClick={onDuplicate}
          className={cn('bg-transparent border-none cursor-pointer text-[13px] mr-1.5 transition-colors', dupHovered ? 'text-foreground' : 'text-muted-foreground/60')}
          onMouseEnter={() => setDupHovered(true)}
          onMouseLeave={() => setDupHovered(false)}
        >
          ⧉
        </button>
        <button
          title="Copiar a otro atleta"
          onClick={onCopyToAthlete}
          className={cn('bg-transparent border-none cursor-pointer text-[13px] mr-1.5 transition-colors', copyHovered ? 'text-foreground' : 'text-muted-foreground/60')}
          onMouseEnter={() => setCopyHovered(true)}
          onMouseLeave={() => setCopyHovered(false)}
        >
          →
        </button>
        <button
          onClick={onDelete}
          className={cn('bg-transparent border-none cursor-pointer text-[13px] transition-colors', delHovered ? 'text-destructive' : 'text-muted-foreground/60')}
          onMouseEnter={() => setDelHovered(true)}
          onMouseLeave={() => setDelHovered(false)}
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

interface PlanCardProps {
  plan: StudyPlan
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onCopyToAthlete: () => void
}

function PlanCard({ plan, onEdit, onDelete, onDuplicate, onCopyToAthlete }: PlanCardProps) {
  const isPublished = plan.status === 'PUBLISHED'
  const [hovered, setHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)
  const [duplicateHovered, setDuplicateHovered] = useState(false)
  const [copyHovered, setCopyHovered] = useState(false)

  return (
    <div
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onEdit() }}
      className={cn(
        'relative p-4 cursor-pointer transition-colors',
        hovered ? 'bg-muted/50' : 'bg-card',
      )}
      style={{ borderLeft: `3px solid ${isPublished ? '#22c55e' : 'var(--border)'}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete() }}
        className={cn(
          'absolute top-2.5 right-2.5 bg-transparent border-none cursor-pointer font-mono text-[11px] px-1 py-0.5 transition-all',
          deleteHovered ? 'text-destructive' : 'text-muted-foreground/60',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        onMouseEnter={e => { e.stopPropagation(); setDeleteHovered(true) }}
        onMouseLeave={e => { e.stopPropagation(); setDeleteHovered(false) }}
        aria-label={`Eliminar plan ${plan.title}`}
      >
        ✕
      </button>

      {/* Card top: title + status badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5 pr-5">
        <div className="font-serif text-[15px] font-bold text-foreground leading-tight flex-1">
          {plan.title}
        </div>
        <span
          className="font-mono text-[8px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 shrink-0 border"
          style={{
            color: isPublished ? '#22c55e' : undefined,
            borderColor: isPublished ? '#22c55e44' : undefined,
          }}
        >
          <span className={isPublished ? '' : 'text-muted-foreground/60 border-border'}>
            {isPublished ? 'PUBLICADO' : 'BORRADOR'}
          </span>
        </span>
      </div>

      {/* Block previews */}
      <div className="flex flex-col gap-0.5 mb-2.5">
        {(plan.blocks ?? []).slice(0, 3).map(b => (
          <div key={b.id} className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-border shrink-0 inline-block" />
            {b.title || 'Bloque sin título'}
          </div>
        ))}
        {(plan.blocks ?? []).length > 3 && (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/40">
            <span className="w-1 h-1 rounded-full bg-border/60 shrink-0 inline-block" />
            +{(plan.blocks ?? []).length - 3} más
          </div>
        )}
        {(plan.blocks ?? []).length === 0 && (
          <div className="font-mono text-[10px] text-muted-foreground/60 italic">
            Sin bloques
          </div>
        )}
      </div>

      {/* Footer: date + viewed */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-mono text-[10px] text-muted-foreground/60">
          {plan.createdAt
            ? new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''}
        </span>
        {plan.viewedByAthlete ? (
          <span className="font-mono text-[9px]" style={{ color: '#22c55e' }}>
            👁 Visto por atleta
          </span>
        ) : (
          <span className="font-mono text-[9px] text-muted-foreground/40">
            No visto
          </span>
        )}
      </div>

      {/* Duplicate / copy-to-athlete actions */}
      <div
        className={cn('absolute bottom-2.5 right-2.5 flex gap-1 transition-opacity', hovered ? 'opacity-100' : 'opacity-0')}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          title="Duplicar"
          onClick={onDuplicate}
          className={cn(
            'bg-transparent border border-border cursor-pointer font-mono text-[11px] px-1.5 py-0.5 transition-colors',
            duplicateHovered ? 'border-muted-foreground text-foreground' : 'text-muted-foreground/60',
          )}
          onMouseEnter={e => { e.stopPropagation(); setDuplicateHovered(true) }}
          onMouseLeave={e => { e.stopPropagation(); setDuplicateHovered(false) }}
        >
          ⧉
        </button>
        <button
          type="button"
          title="Copiar a otro atleta"
          onClick={onCopyToAthlete}
          className={cn(
            'bg-transparent border border-border cursor-pointer font-mono text-[11px] px-1.5 py-0.5 transition-colors',
            copyHovered ? 'border-muted-foreground text-foreground' : 'text-muted-foreground/60',
          )}
          onMouseEnter={e => { e.stopPropagation(); setCopyHovered(true) }}
          onMouseLeave={e => { e.stopPropagation(); setCopyHovered(false) }}
        >
          →
        </button>
      </div>
    </div>
  )
}
