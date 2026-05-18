import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useGyms } from '../gym/hooks'
import { useClassPlans, useCreateClassPlan, useDeleteClassPlan } from './hooks'
import { ClassPlanEditor } from './ClassPlanEditor'
import { useConfirm } from '@/shared/hooks/useConfirm'
import type { ClassPlan } from './types'

const MODALITY_LABEL: Record<string, string> = { GI: 'Gi', NOGI: 'No-Gi', BOTH: 'Ambas' }

export function ClassPlanTab() {
  const { data: gyms } = useGyms()
  const [selectedGymId, setSelectedGymId] = useState<number | undefined>(undefined)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const confirm = useConfirm()
  const effectiveGymId = selectedGymId ?? gyms?.[0]?.id
  const { data: plans, isLoading } = useClassPlans(effectiveGymId)
  const create = useCreateClassPlan(effectiveGymId!)
  const deletePlan = useDeleteClassPlan(effectiveGymId!)

  // Si estamos en modo editor, mostrar el editor
  if (editingPlanId !== null) {
    return (
      <ClassPlanEditor
        planId={editingPlanId}
        gymId={effectiveGymId!}
        onBack={() => setEditingPlanId(null)}
      />
    )
  }

  // Si no hay gimnasios, mostrar CTA
  if (!gyms || gyms.length === 0) {
    return (
      <div className="py-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground font-serif italic">Sin planes de clase todavía</p>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
          Ve a «Mis gimnasios» para crear un gimnasio primero,<br />
          luego podrás añadir planes de clase.
        </p>
      </div>
    )
  }

  async function handleCreate() {
    if (!newTitle.trim() || effectiveGymId === undefined) return
    const plan = await create.mutateAsync({ title: newTitle.trim() })
    setNewTitle('')
    setCreating(false)
    setEditingPlanId(plan.id)
  }

  async function handleDelete(plan: ClassPlan) {
    const ok = await confirm({ description: `¿Eliminar el plan "${plan.title}"?`, variant: 'destructive' })
    if (!ok) return
    deletePlan.mutate(plan.id)
  }

  return (
    <div className="space-y-4">
      {/* Selector de gimnasio — solo si hay más de uno */}
      {gyms.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Gimnasio</span>
          <select
            value={effectiveGymId}
            onChange={e => setSelectedGymId(Number(e.target.value))}
            className="bg-background border border-border px-2 py-1 text-sm outline-none focus:border-foreground"
          >
            {gyms.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Planes de clase{gyms.length === 1 ? ` — ${gyms[0].name}` : ''}
        </p>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide bg-foreground text-background hover:bg-foreground/85 transition-colors px-3 py-1.5 border border-foreground"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Nuevo plan</span>
          </button>
        )}
      </div>

      {/* Formulario de creación */}
      {creating && (
        <div className="flex gap-2 border border-border p-2">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Título del plan (ej. Clase lunes — Guardas)"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button type="button" onClick={handleCreate} className="px-3 py-1 text-xs bg-foreground text-background font-mono uppercase">
            Crear
          </button>
          <button type="button" onClick={() => setCreating(false)} className="px-2 py-1 text-xs border border-border text-muted-foreground">
            ✕
          </button>
        </div>
      )}

      {isLoading && (
        <div className="py-6 text-center text-sm text-muted-foreground">Cargando...</div>
      )}

      {!isLoading && (plans ?? []).length === 0 && !creating && (
        <p className="text-sm text-muted-foreground italic">No hay planes para este gimnasio.</p>
      )}

      {/* Lista de planes */}
      <div className="space-y-2">
        {(plans ?? []).map(plan => (
          <div
            key={plan.id}
            className="border border-border/50 hover:border-border transition-colors cursor-pointer"
            onClick={() => setEditingPlanId(plan.id)}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{plan.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {plan.scheduledDate && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(plan.scheduledDate).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  {plan.modality && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 border border-border/50 text-muted-foreground">
                      {MODALITY_LABEL[plan.modality] ?? plan.modality}
                    </span>
                  )}
                  {plan.durationMinutes && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {plan.durationMinutes} min
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEditingPlanId(plan.id) }}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Editar plan"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(plan) }}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar plan"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
