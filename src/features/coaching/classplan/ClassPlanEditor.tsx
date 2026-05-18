import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, BookOpen, Type, GripVertical } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import {
  useClassPlan,
  useUpdateClassPlan,
  useAddClassBlock,
  useUpdateClassBlock,
  useDeleteClassBlock,
  useReorderClassBlocks,
  useAddClassTextItem,
  useAddClassTechniqueItem,
  useDeleteClassItem,
  useReorderClassItems,
} from './hooks'
import { TechniqueFamilyPicker } from '@/features/coaching/components/TechniqueFamilyPicker'
import type { ClassPlan } from './types'
import type { StudyBlock, StudyItem } from '../studyplan/types'

interface Props {
  planId: number
  gymId: number
  onBack: () => void
}

export function ClassPlanEditor({ planId, gymId, onBack }: Props) {
  const { data: plan, isLoading } = useClassPlan(planId)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const confirm = useConfirm()

  const updateMeta = useUpdateClassPlan(planId, gymId)
  const addBlock = useAddClassBlock(planId)
  const updateBlock = useUpdateClassBlock(planId)
  const deleteBlock = useDeleteClassBlock(planId)
  const reorderBlocks = useReorderClassBlocks(planId)
  const addText = useAddClassTextItem(planId)
  const addTechnique = useAddClassTechniqueItem(planId)
  const deleteItem = useDeleteClassItem(planId)
  const reorderItems = useReorderClassItems(planId)

  if (isLoading || !plan) {
    return <div className="py-8 text-center text-muted-foreground text-sm">Cargando...</div>
  }

  function handleSaveTitle() {
    if (!titleVal.trim()) return
    updateMeta.mutate({
      title: titleVal.trim(),
      description: plan!.description,
      scheduledDate: plan!.scheduledDate,
      durationMinutes: plan!.durationMinutes,
      modality: plan!.modality,
      status: plan!.status,
    })
    setEditingTitle(false)
  }

  function handleMetaChange(field: keyof Pick<ClassPlan, 'scheduledDate' | 'durationMinutes' | 'modality'>, value: string | number | undefined) {
    updateMeta.mutate({
      title: plan!.title,
      description: plan!.description,
      scheduledDate: field === 'scheduledDate' ? (value as string | undefined) : plan!.scheduledDate,
      durationMinutes: field === 'durationMinutes' ? (value as number | undefined) : plan!.durationMinutes,
      modality: field === 'modality' ? (value as ClassPlan['modality']) : plan!.modality,
      status: plan!.status,
    })
  }

  function moveBlock(blocks: StudyBlock[], index: number, dir: -1 | 1) {
    const newOrder = [...blocks]
    const tmp = newOrder[index]
    newOrder[index] = newOrder[index + dir]
    newOrder[index + dir] = tmp
    reorderBlocks.mutate(newOrder.map(b => b.id))
  }

  function moveItem(block: StudyBlock, index: number, dir: -1 | 1) {
    const newOrder = [...block.items]
    const tmp = newOrder[index]
    newOrder[index] = newOrder[index + dir]
    newOrder[index + dir] = tmp
    reorderItems.mutate({ blockId: block.id, orderedIds: newOrder.map(i => i.id) })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {editingTitle ? (
            <div className="flex gap-2">
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
              title="Haz clic para editar el título"
            >
              {plan.title}
            </h2>
          )}

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fecha</span>
              <input
                type="date"
                defaultValue={plan.scheduledDate ?? ''}
                onBlur={e => {
                  const val = e.target.value || undefined
                  handleMetaChange('scheduledDate', val)
                }}
                className="bg-transparent border border-border text-sm px-2 py-0.5 outline-none focus:border-foreground text-foreground [color-scheme:dark]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Duración</span>
              <input
                type="number"
                min={1}
                max={360}
                defaultValue={plan.durationMinutes ?? ''}
                placeholder="min"
                onBlur={e => {
                  const val = e.target.value ? Number(e.target.value) : undefined
                  handleMetaChange('durationMinutes', val)
                }}
                className="bg-transparent border border-border text-sm px-2 py-0.5 outline-none focus:border-foreground w-20"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Modalidad</span>
              <select
                defaultValue={plan.modality ?? ''}
                onChange={e => {
                  const val = e.target.value as ClassPlan['modality'] | ''
                  handleMetaChange('modality', val || undefined)
                }}
                className="bg-background border border-border text-sm px-2 py-0.5 outline-none focus:border-foreground"
              >
                <option value="">—</option>
                <option value="GI">Gi</option>
                <option value="NOGI">No-Gi</option>
                <option value="BOTH">Ambas</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {(plan.blocks ?? []).map((block, blockIdx) => (
          <ClassBlockEditor
            key={block.id}
            block={block}
            index={blockIdx}
            total={plan.blocks.length}
            onMoveUp={() => moveBlock(plan.blocks, blockIdx, -1)}
            onMoveDown={() => moveBlock(plan.blocks, blockIdx, 1)}
            onDelete={async () => {
              const ok = await confirm({ description: '¿Eliminar este bloque?' })
              if (!ok) return
              deleteBlock.mutate(block.id)
            }}
            onUpdateTitle={(title) => updateBlock.mutate({ blockId: block.id, title })}
            onAddText={(content) => addText.mutate({ blockId: block.id, content })}
            onAddTechnique={(techniqueId) => addTechnique.mutate({ blockId: block.id, techniqueId })}
            onDeleteItem={(itemId) => deleteItem.mutate({ blockId: block.id, itemId })}
            onMoveItem={(idx, dir) => moveItem(block, idx, dir)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => addBlock.mutate(undefined)}
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

// ─── ClassBlockEditor ─────────────────────────────────────────────────────────

interface ClassBlockEditorProps {
  block: StudyBlock
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdateTitle: (title: string) => void
  onAddText: (content: string) => void
  onAddTechnique: (techniqueId: number) => void
  onDeleteItem: (itemId: number) => void
  onMoveItem: (index: number, dir: -1 | 1) => void
}

function ClassBlockEditor({
  block, index, total,
  onMoveUp, onMoveDown, onDelete, onUpdateTitle,
  onAddText, onAddTechnique, onDeleteItem, onMoveItem,
}: ClassBlockEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(block.title || '')
  const [textInput, setTextInput] = useState('')
  const [addingText, setAddingText] = useState(false)
  const [selectedTechnique, setSelectedTechnique] = useState<{ id: number; name: string } | null>(null)

  function submitText() {
    if (!textInput.trim()) return
    onAddText(textInput.trim())
    setTextInput('')
    setAddingText(false)
  }

  function submitTechnique() {
    if (!selectedTechnique) return
    onAddTechnique(selectedTechnique.id)
    setSelectedTechnique(null)
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
              onBlur={() => { setEditingTitle(false); onUpdateTitle(titleVal) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { setEditingTitle(false); onUpdateTitle(titleVal) }
                if (e.key === 'Escape') { setEditingTitle(false); setTitleVal(block.title || '') }
              }}
              placeholder="Nombre del bloque"
              className="bg-transparent border-b border-[#3a3a3a] text-[#f0ebe3] font-mono text-sm outline-none w-full"
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              className="cursor-pointer hover:text-white truncate block"
              title="Haz clic para editar"
            >
              {block.title || <span className="text-[#555] italic">Bloque sin título</span>}
            </span>
          )}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        {block.items.map((item, itemIdx) => (
          <ClassItemRow
            key={item.id}
            item={item}
            index={itemIdx}
            total={block.items.length}
            onDelete={() => onDeleteItem(item.id)}
            onMoveUp={() => onMoveItem(itemIdx, -1)}
            onMoveDown={() => onMoveItem(itemIdx, 1)}
          />
        ))}

        {/* Add text */}
        {addingText ? (
          <div className="flex gap-2">
            <textarea
              autoFocus
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitText() } if (e.key === 'Escape') setAddingText(false) }}
              placeholder="Texto del item... (Enter para guardar, Shift+Enter para nueva línea)"
              rows={2}
              className="flex-1 bg-transparent border border-border text-sm outline-none px-2 py-1.5 resize-none placeholder:text-muted-foreground/50"
            />
            <div className="flex flex-col gap-1">
              <button type="button" onClick={submitText} className="px-2 py-1 text-xs bg-foreground text-background">OK</button>
              <button type="button" onClick={() => setAddingText(false)} className="px-2 py-1 text-xs border border-border text-muted-foreground">✕</button>
            </div>
          </div>
        ) : null}

        {/* Add technique inline */}
        {selectedTechnique ? (
          <div className="flex items-center gap-2 p-2 border border-border bg-muted/20">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="flex-1 text-sm">{selectedTechnique.name}</span>
            <button type="button" onClick={submitTechnique} className="px-2 py-1 text-xs bg-foreground text-background">Añadir</button>
            <button type="button" onClick={() => setSelectedTechnique(null)} className="px-2 py-1 text-xs border border-border text-muted-foreground">✕</button>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => { setAddingText(true); setSelectedTechnique(null) }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border/50 hover:border-border px-2 py-1"
          >
            <Type className="h-3 w-3" strokeWidth={1.5} />
            Añadir texto
          </button>
          <ClassTechniquePickerInline onSelect={(id, name) => setSelectedTechnique({ id, name })} />
        </div>
      </div>
    </div>
  )
}

// ─── ClassItemRow ─────────────────────────────────────────────────────────────

function ClassItemRow({ item, index, total, onDelete, onMoveUp, onMoveDown }: {
  item: StudyItem
  index: number
  total: number
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="group flex items-start gap-2 p-2 border border-border/40 bg-background hover:border-border transition-colors">
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
          <span className="whitespace-pre-wrap">{item.content}</span>
        )}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onMoveUp} disabled={index === 0} className="p-0.5 disabled:opacity-20 hover:text-foreground text-muted-foreground">
          <ChevronUp className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1} className="p-0.5 disabled:opacity-20 hover:text-foreground text-muted-foreground">
          <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={onDelete} className="p-0.5 hover:text-destructive text-muted-foreground">
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

// ─── ClassTechniquePickerInline ───────────────────────────────────────────────

function ClassTechniquePickerInline({ onSelect }: { onSelect: (id: number, name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [family, setFamily] = useState('')

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border/50 hover:border-border px-2 py-1"
      >
        <BookOpen className="h-3 w-3" strokeWidth={1.5} />
        Añadir técnica
      </button>
    )
  }

  return (
    <div className="flex-1 space-y-1">
      <TechniqueFamilyPicker
        value={family}
        onChange={setFamily}
        onTechniqueSelect={(t) => {
          if (t.id && t.name) {
            onSelect(t.id, t.name)
            setFamily('')
            setOpen(false)
          }
        }}
      />
      <button
        type="button"
        onClick={() => { setOpen(false); setFamily('') }}
        className="text-xs text-muted-foreground hover:text-foreground font-mono"
      >
        Cancelar
      </button>
    </div>
  )
}
