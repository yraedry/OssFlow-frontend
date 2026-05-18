import { useState, useCallback } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, Pencil, Dumbbell } from 'lucide-react'
import { useExercises } from '@/features/catalog/exercise/hooks'
import { MONO, SERIF } from '@/shared/lib/typography'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { loadRoutines, createRoutine, updateRoutine, deleteRoutine, addBlock, updateBlock, deleteBlock, addExercise, updateExercise, deleteExercise } from '../storage'
import type { Routine, RoutineBlock, RoutineExercise, RoutineCategory } from '../types'
import { ROUTINE_CATEGORIES } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCat(key: RoutineCategory) {
  return ROUTINE_CATEGORIES.find(c => c.key === key)!
}

const TRIGGER_LABELS: Record<RoutineBlock['trigger'], string> = {
  AM: 'Al despertar',
  PM: 'Al acostarse',
  SESSION: 'Sesión',
}

// ─── Small components ─────────────────────────────────────────────────────────

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
      style={{ ...MONO, color: color ?? 'var(--color-muted-foreground)', border: `1px solid ${color ?? 'var(--color-border)'}` }}
    >
      {children}
    </span>
  )
}

function InlineField({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string | number; onChange: (v: string) => void
  type?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border border-border focus:outline-none focus:border-foreground transition-colors px-2 py-1"
        style={{ ...MONO, fontSize: '11px', width: type === 'number' ? '64px' : '100%' }}
      />
    </div>
  )
}

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  ex,
  onUpdate,
  onDelete,
}: {
  ex: RoutineExercise
  onUpdate: (data: Partial<Omit<RoutineExercise, 'id'>>) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-border/60 bg-background">
      <div className="flex items-center gap-2 px-3 py-2">
        <Dumbbell className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="flex-1 text-xs font-medium truncate">{ex.exerciseName}</span>
        <span style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}>
          {ex.sets}×{ex.reps ?? `${ex.durationSeconds}s`}
          {ex.weightKg ? ` · ${ex.weightKg}kg` : ''}
        </span>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <InlineField label="Series" value={ex.sets} type="number"
            onChange={v => onUpdate({ sets: parseInt(v) || 1 })} />
          <InlineField label="Reps" value={ex.reps ?? ''} type="number" placeholder="—"
            onChange={v => onUpdate({ reps: v ? parseInt(v) : undefined })} />
          <InlineField label="Duración (s)" value={ex.durationSeconds ?? ''} type="number" placeholder="—"
            onChange={v => onUpdate({ durationSeconds: v ? parseInt(v) : undefined })} />
          <InlineField label="Peso (kg)" value={ex.weightKg ?? ''} type="number" placeholder="—"
            onChange={v => onUpdate({ weightKg: v ? parseFloat(v) : undefined })} />
          <div className="col-span-2 sm:col-span-4">
            <InlineField label="Notas" value={ex.notes ?? ''} placeholder="Opcional..."
              onChange={v => onUpdate({ notes: v || undefined })} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add exercise picker ───────────────────────────────────────────────────────

function AddExercisePicker({ onAdd }: { onAdd: (exerciseId: number, name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data } = useExercises({ size: 100 })

  const filtered = (data?.content ?? []).filter(e =>
    ['STRENGTH', 'CARDIO', 'MOBILITY', 'FLEXIBILITY', 'CORE'].includes(e.category) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest border border-dashed px-2.5 py-1.5 w-full justify-center transition-all hover:border-solid"
        style={{ ...MONO, borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
      >
        <Plus className="h-3 w-3" /> Añadir ejercicio
      </button>
    )
  }

  return (
    <div className="border border-border bg-background shadow-xl">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <input
          autoFocus
          type="text"
          placeholder="Buscar ejercicio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none"
          style={{ ...MONO, fontSize: '11px' }}
        />
        <button
          type="button"
          onClick={() => { setOpen(false); setSearch('') }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          style={{ ...MONO, fontSize: '10px' }}
        >
          ×
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-muted-foreground" style={{ ...MONO, fontSize: '10px' }}>
            {data?.content?.length === 0 ? 'No tienes ejercicios en el catálogo aún.' : 'Sin resultados'}
          </p>
        ) : (
          filtered.map(ex => (
            <button
              key={ex.id}
              type="button"
              onClick={() => { onAdd(ex.id, ex.name); setOpen(false); setSearch('') }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/50 transition-colors text-left"
            >
              <span className="flex-1 text-xs truncate">{ex.name}</span>
              <span style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)' }}>
                {ex.category}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Block card ───────────────────────────────────────────────────────────────

function BlockCard({
  block,
  onUpdate,
  onDelete,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}: {
  block: RoutineBlock
  onUpdate: (data: Partial<Omit<RoutineBlock, 'id' | 'exercises'>>) => void
  onDelete: () => void
  onAddExercise: (exerciseId: number, name: string) => void
  onUpdateExercise: (exerciseId: string, data: Partial<Omit<RoutineExercise, 'id'>>) => void
  onDeleteExercise: (exerciseId: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)

  return (
    <div className="border border-border">
      {/* Block header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-card">
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            : <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          }
        </button>

        {editingName ? (
          <input
            autoFocus
            type="text"
            value={block.name}
            onChange={e => onUpdate({ name: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
            className="flex-1 bg-transparent border-b border-foreground focus:outline-none text-sm font-semibold"
            style={MONO}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="flex-1 text-left text-sm font-semibold hover:text-muted-foreground transition-colors truncate"
          >
            {block.name}
          </button>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <Tag>{TRIGGER_LABELS[block.trigger]}</Tag>
          <Tag>{block.rounds} rondas</Tag>
          <button
            type="button"
            onClick={onDelete}
            className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-3 border-t border-border/50">
          {/* Block settings row */}
          <div className="flex flex-wrap gap-3">
            <InlineField label="Rondas" value={block.rounds} type="number"
              onChange={v => onUpdate({ rounds: parseInt(v) || 1 })} />
            <InlineField label="Descanso (s)" value={block.restSeconds ?? ''} type="number" placeholder="—"
              onChange={v => onUpdate({ restSeconds: v ? parseInt(v) : undefined })} />
            <div className="flex flex-col gap-0.5">
              <label style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Momento
              </label>
              <select
                value={block.trigger}
                onChange={e => onUpdate({ trigger: e.target.value as RoutineBlock['trigger'] })}
                className="bg-background border border-border focus:outline-none focus:border-foreground transition-colors px-2 py-1"
                style={{ ...MONO, fontSize: '11px' }}
              >
                <option value="SESSION">Sesión</option>
                <option value="AM">Al despertar</option>
                <option value="PM">Al acostarse</option>
              </select>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-1.5">
            {block.exercises.map(ex => (
              <ExerciseRow
                key={ex.id}
                ex={ex}
                onUpdate={data => onUpdateExercise(ex.id, data)}
                onDelete={() => onDeleteExercise(ex.id)}
              />
            ))}
            <AddExercisePicker onAdd={onAddExercise} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Routine form (crear / editar) ───────────────────────────────────────────

function RoutineForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Pick<Routine, 'name' | 'category' | 'description' | 'estimatedMinutes'>>
  onSave: (data: Pick<Routine, 'name' | 'category' | 'description' | 'estimatedMinutes'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<RoutineCategory>(initial?.category ?? 'STRENGTH')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimatedMinutes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Nombre *
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Empuje, Movilidad matutina..."
            className="w-full mt-1 bg-transparent border border-border focus:border-foreground focus:outline-none px-3 py-2 transition-colors"
            style={{ ...MONO, fontSize: '12px' }}
          />
        </div>

        <div>
          <label style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Categoría
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {ROUTINE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className="px-3 py-1 border transition-all"
                style={{
                  ...MONO, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderColor: category === cat.key ? cat.color : 'var(--color-border)',
                  backgroundColor: category === cat.key ? `${cat.color}18` : 'transparent',
                  color: category === cat.key ? cat.color : 'var(--color-muted-foreground)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InlineField label="Duración estimada (min)" value={estimatedMinutes} type="number" placeholder="—"
            onChange={v => setEstimatedMinutes(v ? Number(v) : '')} />
        </div>

        <div>
          <label style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Descripción
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Opcional..."
            rows={2}
            className="w-full mt-1 bg-transparent border border-border focus:border-foreground focus:outline-none px-3 py-2 transition-colors resize-none"
            style={{ ...MONO, fontSize: '11px' }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
          style={MONO}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-[2] py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-40"
          style={MONO}
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

// ─── Routine detail view ──────────────────────────────────────────────────────

function RoutineDetail({
  routine: initial,
  onBack,
  onUpdated,
}: {
  routine: Routine
  onBack: () => void
  onUpdated: (r: Routine) => void
}) {
  const [routine, setRoutine] = useState(initial)
  const [addingBlock, setAddingBlock] = useState(false)
  const [blockName, setBlockName] = useState('')
  const [editing, setEditing] = useState(false)
  const confirm = useConfirm()
  const cat = getCat(routine.category)

  function refresh(r: Routine) { setRoutine(r); onUpdated(r) }

  function handleAddBlock(e: React.FormEvent) {
    e.preventDefault()
    if (!blockName.trim()) return
    const r = addBlock(routine.id, {
      name: blockName.trim(),
      rounds: 3,
      trigger: 'SESSION',
    })
    refresh(r)
    setBlockName('')
    setAddingBlock(false)
  }

  if (editing) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          style={MONO}
        >
          ← Volver
        </button>
        <div className="border border-border p-5">
          <p style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Editar rutina
          </p>
          <RoutineForm
            initial={routine}
            onSave={data => {
              const r = updateRoutine(routine.id, data)
              refresh(r)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border border-border bg-card px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          style={MONO}
        >
          ← Rutinas
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Tag color={cat.color}>{cat.label}</Tag>
            <h1 className="text-2xl font-black leading-none" style={SERIF}>{routine.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {routine.estimatedMinutes && (
                <span style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}>
                  ~{routine.estimatedMinutes} min
                </span>
              )}
              <span style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}>
                {routine.blocks.length} {routine.blocks.length === 1 ? 'bloque' : 'bloques'}
              </span>
            </div>
            {routine.description && (
              <p className="text-sm text-muted-foreground">{routine.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs hover:bg-accent transition-colors"
            style={MONO}
          >
            <Pencil className="h-3 w-3" strokeWidth={1.5} />
            Editar
          </button>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {routine.blocks.length === 0 && !addingBlock && (
          <div className="border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground mb-1">Sin bloques todavía</p>
            <p className="text-xs text-muted-foreground">
              Añade bloques para estructurar tu rutina (calentamiento, principal, vuelta a la calma...)
            </p>
          </div>
        )}

        {routine.blocks.map(block => (
          <BlockCard
            key={block.id}
            block={block}
            onUpdate={data => refresh(updateBlock(routine.id, block.id, data))}
            onDelete={async () => {
              const ok = await confirm({ description: `¿Eliminar el bloque "${block.name}"?` })
              if (ok) refresh(deleteBlock(routine.id, block.id))
            }}
            onAddExercise={(exerciseId, name) =>
              refresh(addExercise(routine.id, block.id, { exerciseId, exerciseName: name, sets: 3, reps: 10 }))
            }
            onUpdateExercise={(exerciseId, data) =>
              refresh(updateExercise(routine.id, block.id, exerciseId, data))
            }
            onDeleteExercise={exerciseId =>
              refresh(deleteExercise(routine.id, block.id, exerciseId))
            }
          />
        ))}

        {/* Add block */}
        {addingBlock ? (
          <form onSubmit={handleAddBlock} className="border border-border p-3 flex gap-2">
            <input
              autoFocus
              type="text"
              value={blockName}
              onChange={e => setBlockName(e.target.value)}
              placeholder="Nombre del bloque (ej: Principal, Calentamiento...)"
              className="flex-1 bg-transparent border border-border focus:border-foreground focus:outline-none px-2 py-1.5 transition-colors"
              style={{ ...MONO, fontSize: '11px' }}
            />
            <button
              type="submit"
              disabled={!blockName.trim()}
              className="px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-40"
              style={MONO}
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => { setAddingBlock(false); setBlockName('') }}
              className="px-2 py-1.5 border border-border text-[10px] hover:bg-accent transition-colors"
              style={MONO}
            >
              ×
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingBlock(true)}
            className="flex items-center gap-2 w-full py-3 border border-dashed border-border hover:border-foreground hover:text-foreground text-muted-foreground transition-colors justify-center"
            style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            <Plus className="h-3.5 w-3.5" /> Añadir bloque
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Routine card ─────────────────────────────────────────────────────────────

function RoutineCard({
  routine,
  onView,
  onDelete,
}: {
  routine: Routine
  onView: () => void
  onDelete: () => void
}) {
  const cat = getCat(routine.category)
  const totalExercises = routine.blocks.reduce((a, b) => a + b.exercises.length, 0)

  return (
    <div
      className="group relative flex flex-col bg-card border border-border cursor-pointer hover:border-foreground/40 transition-colors"
      style={{ borderLeft: `3px solid ${cat.color}` }}
      onClick={onView}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Tag color={cat.color}>{cat.label}</Tag>
        <p className="text-sm font-semibold leading-snug pr-8">{routine.name}</p>
        {routine.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{routine.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50">
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)' }}>
          {routine.blocks.length} bloques
        </span>
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)' }}>
          {totalExercises} ejercicios
        </span>
        {routine.estimatedMinutes && (
          <span style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)' }}>
            ~{routine.estimatedMinutes} min
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>(() => loadRoutines())
  const [viewing, setViewing] = useState<Routine | null>(null)
  const [creating, setCreating] = useState(false)
  const confirm = useConfirm()

  const refresh = useCallback(() => setRoutines(loadRoutines()), [])

  function handleCreate(data: Pick<Routine, 'name' | 'category' | 'description' | 'estimatedMinutes'>) {
    const r = createRoutine(data)
    refresh()
    setCreating(false)
    setViewing(r)
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({ description: `¿Eliminar la rutina "${name}"? Esta acción no se puede deshacer.` })
    if (!ok) return
    deleteRoutine(id)
    refresh()
    if (viewing?.id === id) setViewing(null)
  }

  // Vista de detalle
  if (viewing) {
    return (
      <RoutineDetail
        routine={viewing}
        onBack={() => { setViewing(null); refresh() }}
        onUpdated={r => setViewing(r)}
      />
    )
  }

  // Formulario de creación
  if (creating) {
    return (
      <div className="space-y-5">
        <div className="border border-border bg-card px-5 py-4">
          <div style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Planificación
          </div>
          <h1 className="text-2xl font-black leading-none" style={SERIF}>Nueva rutina</h1>
        </div>
        <div className="border border-border p-5">
          <RoutineForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      </div>
    )
  }

  // Lista de rutinas
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Planificación
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Rutinas
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nueva rutina
        </button>
      </div>

      {/* Category pills */}
      {routines.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ROUTINE_CATEGORIES.filter(cat => routines.some(r => r.category === cat.key)).map(cat => (
            <Tag key={cat.key} color={cat.color}>{cat.label} ({routines.filter(r => r.category === cat.key).length})</Tag>
          ))}
        </div>
      )}

      {/* Grid */}
      {routines.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <Dumbbell className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" strokeWidth={1} />
          <p className="text-sm text-muted-foreground mb-1">Sin rutinas todavía</p>
          <p className="text-xs text-muted-foreground mb-4">
            Crea tu primera rutina y organiza tus sesiones de fuerza, movilidad o flexibilidad
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
            style={MONO}
          >
            <Plus className="h-3.5 w-3.5" /> Crear rutina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {routines.map(r => (
            <RoutineCard
              key={r.id}
              routine={r}
              onView={() => setViewing(r)}
              onDelete={() => handleDelete(r.id, r.name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
