import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/components/ui/spinner'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, BookOpen, ChevronDown, ChevronUp, Trash2, Pencil, Check, X } from 'lucide-react'
import { useStudyPlans, useCreateStudyPlan, useDeleteStudyPlan, useUpdateStudyPlan } from '../hooks'
import { useStudyBlocks, useCreateStudyBlock, useDeleteStudyBlock, useUpdateStudyBlock } from '@/features/planning/studyblock/hooks'
import { useReceivedStudyPlans } from '@/features/coaching/studyplan/hooks'
import { ReceivedPlanViewer } from '@/features/coaching/studyplan/ReceivedPlanViewer'
import type { StudyPlan } from '../types'
import type { StudyBlock } from '@/features/planning/studyblock/types'
import type { StudyPlan as CoachStudyPlan } from '@/features/coaching/studyplan/types'

// ─── Main page ────────────────────────────────────────────────────────────────

export function StudyPlansPage() {
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [viewingCoachPlanId, setViewingCoachPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    try { return (localStorage.getItem('studyplan-view') as 'cards' | 'table') ?? 'cards' } catch { return 'cards' }
  })
  const confirm = useConfirm()

  const { data, isLoading } = useStudyPlans()
  const { data: receivedPlans, isLoading: receivedLoading } = useReceivedStudyPlans()
  const create = useCreateStudyPlan()
  const deletePlan = useDeleteStudyPlan()

  const plans = data?.content ?? []

  function toggleView() {
    const next = viewMode === 'cards' ? 'table' : 'cards'
    setViewMode(next)
    try { localStorage.setItem('studyplan-view', next) } catch { /* ignore */ }
  }

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
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] border border-border px-3 py-1.5 bg-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" strokeWidth={1.5} />
              Nuevo plan
            </button>
          </div>
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
        ) : viewMode === 'table' ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Título', 'Estado', 'Fecha', ''].map(h => (
                  <th key={h} className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground/60 px-4 py-1.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <AthleteTableRow
                  key={plan.id}
                  plan={plan}
                  onEdit={() => setEditingPlanId(plan.id)}
                  onDelete={() => handleDelete(plan)}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-border">
            {plans.map(plan => (
              <AthletePlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => setEditingPlanId(plan.id)}
                onDelete={() => handleDelete(plan)}
              />
            ))}
            <div
              onClick={() => setCreating(true)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCreating(true) }}
              className="border border-dashed border-border p-4 cursor-pointer flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground hover:border-muted-foreground hover:text-foreground min-h-[120px] bg-transparent transition-colors"
            >
              ＋ NUEVO PLAN
            </div>
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
            <div className="grid grid-cols-2 gap-px bg-border">
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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6b7280', ACTIVE: '#22c55e', COMPLETED: '#3b82f6', ARCHIVED: '#f59e0b',
}
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador', ACTIVE: 'Activo', COMPLETED: 'Completado', ARCHIVED: 'Archivado',
}

function AthletePlanCard({ plan, onEdit, onDelete }: { plan: StudyPlan; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)
  const accent = STATUS_COLORS[plan.status] ?? '#6b7280'

  return (
    <div
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onEdit() }}
      className={cn('relative p-4 cursor-pointer transition-colors', hovered ? 'bg-muted/50' : 'bg-card')}
      style={{ borderLeft: `3px solid ${accent}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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

      <div className="flex items-start justify-between gap-2 mb-2.5 pr-5">
        <div className="font-serif text-[15px] font-bold text-foreground leading-tight flex-1">
          {plan.title}
        </div>
        <span className="font-mono text-[8px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 shrink-0 border"
          style={{ color: accent, borderColor: `${accent}44` }}>
          {STATUS_LABELS[plan.status] ?? plan.status}
        </span>
      </div>

      {plan.goalMarkdown && (
        <p className="font-mono text-[10px] text-muted-foreground/70 line-clamp-2 mb-2.5">{plan.goalMarkdown}</p>
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

// ─── AthleteTableRow ──────────────────────────────────────────────────────────

function AthleteTableRow({ plan, onEdit, onDelete }: { plan: StudyPlan; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const accent = STATUS_COLORS[plan.status] ?? '#6b7280'

  return (
    <tr
      onClick={onEdit}
      className={cn('border-b border-border cursor-pointer transition-colors', hovered ? 'bg-muted/50' : 'bg-transparent')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="font-sans text-[13px] text-foreground px-4 py-2.5 font-medium">{plan.title}</td>
      <td className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase px-4 py-2.5" style={{ color: accent }}>
        {STATUS_LABELS[plan.status] ?? plan.status}
      </td>
      <td className="font-mono text-[11px] text-muted-foreground px-4 py-2.5">
        {new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
      </td>
      <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
        <button
          onClick={onDelete}
          className="bg-transparent border-none cursor-pointer text-[13px] text-muted-foreground/60 hover:text-destructive transition-colors"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

// ─── ReceivedPlanCard ─────────────────────────────────────────────────────────

function ReceivedPlanCard({ plan, onView }: { plan: CoachStudyPlan; onView: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isPublished = plan.status === 'PUBLISHED'

  return (
    <div
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onView() }}
      className={cn('relative p-4 cursor-pointer transition-colors', hovered ? 'bg-muted/50' : 'bg-card')}
      style={{ borderLeft: `3px solid ${isPublished ? '#22c55e' : 'var(--border)'}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="font-serif text-[15px] font-bold text-foreground leading-tight flex-1">{plan.title}</div>
        <span className="font-mono text-[8px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 shrink-0 border"
          style={{ color: isPublished ? '#22c55e' : undefined, borderColor: isPublished ? '#22c55e44' : 'var(--border)' }}>
          <span className={isPublished ? '' : 'text-muted-foreground/60'}>
            {isPublished ? 'PUBLICADO' : 'BORRADOR'}
          </span>
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
  const updatePlan = useUpdateStudyPlan()
  const addBlock = useCreateStudyBlock(planId)
  const deleteBlock = useDeleteStudyBlock(planId)
  const updateBlock = useUpdateStudyBlock(planId)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [addingBlock, setAddingBlock] = useState(false)
  const [newBlockTitle, setNewBlockTitle] = useState('')

  const blocks = blocksData?.content ?? []

  if (isLoading || !plan) return <div className="py-8 flex justify-center"><Spinner /></div>

  const accent = STATUS_COLORS[plan.status] ?? '#6b7280'

  function handleSaveTitle() {
    if (!titleVal.trim()) return
    updatePlan.mutate({ id: planId, data: { title: titleVal.trim() } })
    setEditingTitle(false)
  }

  async function handleAddBlock() {
    if (!newBlockTitle.trim()) return
    await addBlock.mutateAsync({ title: newBlockTitle.trim(), blockOrder: blocks.length + 1 })
    setNewBlockTitle('')
    setAddingBlock(false)
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
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                className="flex-1 bg-transparent border-b border-foreground text-xl font-bold outline-none"
              />
            </div>
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
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border shrink-0"
          style={{ color: accent, borderColor: `${accent}44` }}>
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
              index={i}
              onDelete={() => handleDeleteBlock(block.id)}
              onUpdateTitle={(title) => updateBlock.mutate({ blockId: block.id, data: { title } })}
              onUpdateNotes={(notes) => updateBlock.mutate({ blockId: block.id, data: { notesMarkdown: notes || undefined } })}
            />
          ))}
        </div>
      )}

      {/* Add block */}
      {addingBlock ? (
        <div className="flex gap-2 border border-border p-3 bg-card">
          <input
            autoFocus
            value={newBlockTitle}
            onChange={e => setNewBlockTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddBlock()
              if (e.key === 'Escape') { setAddingBlock(false); setNewBlockTitle('') }
            }}
            placeholder="Nombre del bloque..."
            className="flex-1 bg-transparent text-sm outline-none font-mono placeholder:text-muted-foreground/50"
          />
          <button type="button" onClick={handleAddBlock} disabled={!newBlockTitle.trim() || addBlock.isPending}
            className="px-3 py-1 font-mono text-[10px] uppercase bg-foreground text-background cursor-pointer disabled:opacity-50">
            {addBlock.isPending ? <Spinner /> : 'Añadir'}
          </button>
          <button type="button" onClick={() => { setAddingBlock(false); setNewBlockTitle('') }}
            className="px-2 py-1 font-mono text-[10px] border border-border bg-transparent text-muted-foreground cursor-pointer">
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingBlock(true)}
          className="w-full py-2 border border-dashed border-border text-sm text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Añadir bloque
        </button>
      )}

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

function AthleteBlockEditor({ block, index, onDelete, onUpdateTitle, onUpdateNotes }: {
  block: StudyBlock
  index: number
  onDelete: () => void
  onUpdateTitle: (title: string) => void
  onUpdateNotes: (notes: string) => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(block.title)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesVal, setNotesVal] = useState(block.notesMarkdown ?? '')
  // savedNotes tracks optimistic local value so UI updates immediately after save
  const [savedNotes, setSavedNotes] = useState(block.notesMarkdown ?? '')
  const [open, setOpen] = useState(true)

  function saveTitle() {
    setEditingTitle(false)
    onUpdateTitle(titleVal.trim() || block.title)
  }

  function saveNotes() {
    setSavedNotes(notesVal)
    setEditingNotes(false)
    onUpdateNotes(notesVal)
  }

  function cancelNotes() {
    setNotesVal(savedNotes)
    setEditingNotes(false)
  }

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-1">#{index + 1}</span>
        <span className="flex-1 text-sm font-semibold min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditingTitle(false); setTitleVal(block.title) } }}
              placeholder="Nombre del bloque"
              className="bg-transparent border-b border-border text-sm outline-none w-full font-mono"
            />
          ) : (
            <span onClick={() => setEditingTitle(true)} className="cursor-pointer hover:opacity-70 transition-opacity truncate block" title="Haz clic para editar">
              {block.title || <span className="text-muted-foreground/50 italic">Bloque sin título</span>}
            </span>
          )}
        </span>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => setOpen(v => !v)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            {open ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />}
          </button>
          <button type="button" onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-3 space-y-2">
          {/* Dates */}
          {(block.startDate || block.endDate) && (
            <p className="font-mono text-[10px] text-muted-foreground/60">
              {block.startDate}{block.endDate ? ` → ${block.endDate}` : ''}
            </p>
          )}

          {/* Notes */}
          {editingNotes ? (
            <div className="space-y-1">
              <textarea
                autoFocus
                value={notesVal}
                onChange={e => setNotesVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') cancelNotes() }}
                rows={3}
                className="w-full bg-transparent border border-border text-sm outline-none px-2 py-1.5 resize-none font-mono placeholder:text-muted-foreground/50"
                placeholder="Notas del bloque..."
              />
              <div className="flex gap-1.5">
                <button type="button" onClick={saveNotes}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-foreground text-background font-mono uppercase">
                  <Check className="h-3 w-3" strokeWidth={2} />
                </button>
                <button type="button" onClick={cancelNotes}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-border text-muted-foreground font-mono uppercase">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingNotes(true)}
              className="cursor-pointer hover:opacity-70 transition-opacity min-h-[32px]"
            >
              {savedNotes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{savedNotes}</p>
              ) : (
                <p className="text-sm text-muted-foreground/40 italic flex items-center gap-1.5">
                  <Pencil className="h-3 w-3" strokeWidth={1.5} />
                  Añadir notas...
                </p>
              )}
            </div>
          )}

          {/* Focus entities */}
          {block.focusEntities && (
            <p className="font-mono text-[10px] text-muted-foreground/60 border-t border-border/40 pt-2">
              {block.focusEntities}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
