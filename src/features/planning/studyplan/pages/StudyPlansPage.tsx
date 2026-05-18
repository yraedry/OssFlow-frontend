import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, BookOpen, Trash2, Type, GripVertical } from 'lucide-react'
import { useStudyPlans, useCreateStudyPlan, useDeleteStudyPlan, useUpdateStudyPlan } from '../hooks'
import {
  useStudyBlocks, useCreateStudyBlock, useUpdateStudyBlock, useDeleteStudyBlock,
  useStudyItems, useAddTextItem, useAddTechniqueItem, useDeleteStudyItem,
} from '@/features/planning/studyblock/hooks'
import { useReceivedStudyPlans } from '@/features/coaching/studyplan/hooks'
import { ReceivedPlanViewer } from '@/features/coaching/studyplan/ReceivedPlanViewer'
import { TechniqueFamilyPicker } from '@/features/coaching/components/TechniqueFamilyPicker'
import type { StudyPlan } from '../types'
import type { StudyBlock, StudyItem } from '@/features/planning/studyblock/types'
import type { StudyPlan as CoachStudyPlan } from '@/features/coaching/studyplan/types'

// ─── Main page ────────────────────────────────────────────────────────────────

export function StudyPlansPage() {
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [viewingCoachPlanId, setViewingCoachPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const confirm = useConfirm()

  const { data, isLoading } = useStudyPlans()
  const { data: receivedPlans, isLoading: receivedLoading } = useReceivedStudyPlans()
  const create = useCreateStudyPlan()
  const deletePlan = useDeleteStudyPlan()

  const plans = data?.content ?? []

  async function handleCreate() {
    if (!newTitle.trim()) return
    await create.mutateAsync({ title: newTitle.trim(), status: 'ACTIVE' })
    setNewTitle('')
    setCreating(false)
  }

  async function handleDelete(plan: StudyPlan) {
    const ok = await confirm({ description: `¿Eliminar el plan "${plan.title}"?` })
    if (!ok) return
    deletePlan.mutate(plan.id)
  }

  if (viewingCoachPlanId) {
    return <ReceivedPlanViewer planId={viewingCoachPlanId} onBack={() => setViewingCoachPlanId(null)} />
  }

  if (editingPlanId) {
    return <AthleteStudyPlanEditor planId={editingPlanId} onBack={() => setEditingPlanId(null)} />
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Mis planes ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Mis planes
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] border border-foreground px-3 py-1.5 bg-foreground text-background hover:bg-foreground/85 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" strokeWidth={1.5} />
            Nuevo plan
          </button>
        </div>

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

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {plans.map(plan => (
              <AthletePlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => setEditingPlanId(plan.id)}
                onDelete={() => handleDelete(plan)}
              />
            ))}
          </div>
        )}

        {!isLoading && plans.length === 0 && !creating && (
          <div className="border border-dashed border-border p-10 flex flex-col items-center gap-3 text-center">
            <BookOpen className="w-7 h-7 text-muted-foreground/30" strokeWidth={1} />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Sin planes todavía — crea el primero
            </p>
          </div>
        )}
      </div>

      {/* ── Planes del maestro ─────────────────────────────────────────────── */}
      {(receivedLoading || (receivedPlans && receivedPlans.length > 0)) && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Planes de tu maestro
          </p>

          {receivedLoading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {receivedPlans!.map(plan => (
                <ReceivedPlanCard
                  key={plan.id}
                  plan={plan}
                  onView={() => setViewingCoachPlanId(plan.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── AthletePlanCard ──────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador', ACTIVE: 'Activo', COMPLETED: 'Completado', ARCHIVED: 'Archivado',
}

function AthletePlanCard({ plan, onEdit, onDelete }: { plan: StudyPlan; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)

  return (
    <div
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onEdit() }}
      className={cn('relative p-3 cursor-pointer transition-colors border border-border', hovered ? 'bg-muted/30' : 'bg-card')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete() }}
        className={cn(
          'absolute top-1.5 right-1.5 p-1 bg-transparent border-none cursor-pointer transition-all',
          deleteHovered ? 'text-destructive' : 'text-muted-foreground/40',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        onMouseEnter={e => { e.stopPropagation(); setDeleteHovered(true) }}
        onMouseLeave={e => { e.stopPropagation(); setDeleteHovered(false) }}
        aria-label={`Eliminar plan ${plan.title}`}
      >
        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
      </button>

      <div className="flex items-start justify-between gap-2 mb-2 pr-5">
        <div className="font-serif text-[13px] font-bold text-foreground leading-tight flex-1">
          {plan.title}
        </div>
        <span className="font-mono text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 shrink-0 border border-border text-muted-foreground">
          {STATUS_LABELS[plan.status] ?? plan.status}
        </span>
      </div>

      {plan.goalMarkdown && (
        <p className="font-mono text-[10px] text-muted-foreground/70 line-clamp-2 mb-2">{plan.goalMarkdown}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-mono text-[10px] text-muted-foreground/60">
          {new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        {(plan.startDate || plan.endDate) && (
          <span className="font-mono text-[9px] text-muted-foreground/40">
            {plan.startDate}{plan.endDate ? ` → ${plan.endDate}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── ReceivedPlanCard ─────────────────────────────────────────────────────────

function ReceivedPlanCard({ plan, onView }: { plan: CoachStudyPlan; onView: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onView() }}
      className={cn('relative p-4 cursor-pointer transition-colors border border-border', hovered ? 'bg-muted/30' : 'bg-card')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="font-serif text-[15px] font-bold text-foreground leading-tight flex-1">{plan.title}</div>
        <span className="font-mono text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 shrink-0 border border-border text-muted-foreground">
          {plan.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 mb-2.5">
        {(plan.blocks ?? []).slice(0, 3).map(b => (
          <div key={b.id} className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-border shrink-0 inline-block" />
            {b.title || 'Bloque sin título'}
          </div>
        ))}
        {(plan.blocks ?? []).length > 3 && (
          <div className="font-mono text-[10px] text-muted-foreground/40">+{(plan.blocks ?? []).length - 3} más</div>
        )}
        {(plan.blocks ?? []).length === 0 && (
          <div className="font-mono text-[10px] text-muted-foreground/60 italic">Sin bloques</div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-mono text-[10px] text-muted-foreground/60">
          {new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-wide">Ver →</span>
      </div>
    </div>
  )
}

// ─── AthleteStudyPlanEditor ───────────────────────────────────────────────────

function AthleteStudyPlanEditor({ planId, onBack }: { planId: number; onBack: () => void }) {
  const confirm = useConfirm()
  const { data, isLoading } = useStudyPlans()
  const plan = data?.content.find(p => p.id === planId)
  const { data: blocksData, isLoading: blocksLoading } = useStudyBlocks(planId)
  const addBlock = useCreateStudyBlock(planId)
  const deleteBlock = useDeleteStudyBlock(planId)
  const addText = useAddTextItem(planId)
  const addTechnique = useAddTechniqueItem(planId)
  const deleteItem = useDeleteStudyItem(planId)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const updatePlan = useUpdateStudyPlan()

  const blocks = blocksData?.content ?? []

  if (isLoading || !plan) return <div className="py-8 flex justify-center"><Spinner /></div>

  function handleSaveTitle() {
    if (!titleVal.trim()) return
    updatePlan.mutate({ id: planId, data: { title: titleVal.trim() } })
    setEditingTitle(false)
  }

  async function handleDeleteBlock(blockId: number) {
    const ok = await confirm({ description: '¿Eliminar este bloque?' })
    if (!ok) return
    deleteBlock.mutate(blockId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
              className="w-full bg-transparent border-b border-foreground text-xl font-bold outline-none"
            />
          ) : (
            <h2
              className="text-xl font-bold cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => { setTitleVal(plan.title); setEditingTitle(true) }}
              title="Haz clic para editar"
            >
              {plan.title}
            </h2>
          )}
          {plan.goalMarkdown && (
            <p className="mt-1 text-sm text-muted-foreground">{plan.goalMarkdown}</p>
          )}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-border text-muted-foreground shrink-0">
          {STATUS_LABELS[plan.status] ?? plan.status}
        </span>
      </div>

      {/* Blocks */}
      {blocksLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, i) => (
            <AthleteBlockEditor
              key={block.id}
              block={block}
              planId={planId}
              index={i}
              onDelete={() => handleDeleteBlock(block.id)}
              onAddText={(content) => addText.mutate({ blockId: block.id, description: content })}
              onAddTechnique={(id, name) => addTechnique.mutate({ blockId: block.id, techniqueId: id, techniqueName: name })}
              onDeleteItem={(itemId) => deleteItem.mutate({ blockId: block.id, itemId })}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => addBlock.mutate({ title: `Bloque ${blocks.length + 1}`, blockOrder: blocks.length + 1 })}
        disabled={addBlock.isPending}
        className="w-full py-2 border border-dashed border-border text-sm text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Añadir bloque
      </button>

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

// ─── AthleteBlockEditor ───────────────────────────────────────────────────────

function AthleteBlockEditor({ block, planId, index, onDelete, onAddText, onAddTechnique, onDeleteItem }: {
  block: StudyBlock
  planId: number
  index: number
  onDelete: () => void
  onAddText: (content: string) => void
  onAddTechnique: (id: number, name: string) => void
  onDeleteItem: (itemId: number) => void
}) {
  const { data: items = [] } = useStudyItems(planId, block.id)
  const updateBlock = useUpdateStudyBlock(planId)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(block.title)
  const [addingText, setAddingText] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [pickingTechnique, setPickingTechnique] = useState(false)
  const [techFamily, setTechFamily] = useState('')
  const [selectedTech, setSelectedTech] = useState<{ id: number; name: string } | null>(null)

  function submitText() {
    if (!textInput.trim()) return
    onAddText(textInput.trim())
    setTextInput('')
    setAddingText(false)
  }

  function submitTechnique() {
    if (!selectedTech) return
    onAddTechnique(selectedTech.id, selectedTech.name)
    setSelectedTech(null)
    setTechFamily('')
    setPickingTechnique(false)
  }

  return (
    <div className="border border-border bg-card">
      {/* Block header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-1">#{index + 1}</span>
        <span className="flex-1 text-sm font-semibold min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={() => { if (titleVal.trim()) updateBlock.mutate({ blockId: block.id, data: { title: titleVal.trim() } }); setEditingTitle(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { if (titleVal.trim()) updateBlock.mutate({ blockId: block.id, data: { title: titleVal.trim() } }); setEditingTitle(false) }
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              placeholder="Nombre del bloque"
              className="bg-transparent border-b border-border text-sm outline-none w-full font-mono"
            />
          ) : (
            <span onClick={() => setEditingTitle(true)} className="cursor-pointer hover:opacity-70 transition-opacity truncate block" title="Haz clic para editar">
              {block.title || <span className="text-muted-foreground/50 italic">Bloque sin título</span>}
            </span>
          )}
        </span>
        <button type="button" onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        {items.map((item, i) => (
          <AthleteItemRow
            key={item.id}
            item={item}
            index={i}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}

        {/* Add text input */}
        {addingText && (
          <div className="flex gap-2">
            <textarea
              autoFocus
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitText() }
                if (e.key === 'Escape') setAddingText(false)
              }}
              placeholder="Texto del item... (Enter para guardar)"
              rows={2}
              className="flex-1 bg-transparent border border-border text-sm outline-none px-2 py-1.5 resize-none placeholder:text-muted-foreground/50"
            />
            <div className="flex flex-col gap-1">
              <button type="button" onClick={submitText} className="px-2 py-1 text-xs bg-foreground text-background">OK</button>
              <button type="button" onClick={() => setAddingText(false)} className="px-2 py-1 text-xs border border-border text-muted-foreground">✕</button>
            </div>
          </div>
        )}

        {/* Add technique picker */}
        {pickingTechnique && (
          <div className="space-y-1">
            <TechniqueFamilyPicker
              value={techFamily}
              onChange={setTechFamily}
              onTechniqueSelect={(t) => {
                if (t.id && t.name) setSelectedTech({ id: t.id, name: t.name })
                else setSelectedTech(null)
              }}
            />
            {selectedTech && (
              <div className="flex items-center gap-2 p-2 border border-border bg-muted/20">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <span className="flex-1 text-sm">{selectedTech.name}</span>
                <button type="button" onClick={submitTechnique} className="px-2 py-1 text-xs bg-foreground text-background">Añadir</button>
                <button type="button" onClick={() => setSelectedTech(null)} className="px-2 py-1 text-xs border border-border text-muted-foreground">✕</button>
              </div>
            )}
            <button type="button" onClick={() => { setPickingTechnique(false); setTechFamily(''); setSelectedTech(null) }}
              className="text-xs text-muted-foreground hover:text-foreground font-mono">
              Cancelar
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!addingText && !pickingTechnique && (
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAddingText(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border/50 hover:border-border px-2 py-1"
            >
              <Type className="h-3 w-3" strokeWidth={1.5} />
              Añadir texto
            </button>
            <button
              type="button"
              onClick={() => setPickingTechnique(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border/50 hover:border-border px-2 py-1"
            >
              <BookOpen className="h-3 w-3" strokeWidth={1.5} />
              Añadir técnica
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AthleteItemRow ───────────────────────────────────────────────────────────

function AthleteItemRow({ item, index, onDelete }: { item: StudyItem; index: number; onDelete: () => void }) {
  return (
    <div className="group flex items-start gap-2 p-2 border border-border/40 bg-background hover:border-border transition-colors">
      <span className="text-[10px] font-mono text-muted-foreground/50 mt-0.5 shrink-0 w-4">{index + 1}</span>
      {item.targetType === 'TECHNIQUE' ? (
        <BookOpen className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" strokeWidth={1.5} />
      ) : (
        <Type className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" strokeWidth={1.5} />
      )}
      <span className="flex-1 text-sm min-w-0">
        {item.targetType === 'TECHNIQUE' ? (
          <span className="font-medium">{item.description}</span>
        ) : (
          <span className="whitespace-pre-wrap">{item.description}</span>
        )}
      </span>
      <button type="button" onClick={onDelete} className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive text-muted-foreground transition-all">
        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
      </button>
    </div>
  )
}
