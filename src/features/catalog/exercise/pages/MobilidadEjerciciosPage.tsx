import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SearchInput } from '@/shared/components/ui/search-input'
import { Plus, Pencil, Trash2, Dumbbell, Play, ArrowLeft } from 'lucide-react'
import { YouTubePlayerModal } from '@/shared/components/ui/youtube-player-modal'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { ExerciseForm } from '../components/ExerciseForm'
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '../hooks'
import type { Exercise, EquipmentType } from '../types'
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '../types'
import type { CreateExerciseForm } from '../schemas'

const EQUIPMENT_ACCENT: Record<EquipmentType, string> = {
  NO_EQUIPMENT: '#10b981',
  HOME:         '#0ea5e9',
  GYM:          '#8b5cf6',
}

function ExerciseDetailView({
  exercise: ex,
  onEdit,
  onDelete,
  onBack,
}: {
  exercise: Exercise
  onEdit: (e: Exercise) => void
  onDelete: (id: number) => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Movilidad
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-2xl font-black" style={{ fontFamily: 'var(--font-serif)' }}>{ex.name}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400" style={{ fontFamily: 'var(--font-mono)' }}>
              {CATEGORY_LABELS[ex.category]}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
              {EQUIPMENT_LABELS[ex.equipment]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(ex)} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onDelete(ex.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </div>

      {ex.youtubeUrl && (
        <div className="border border-border bg-card p-5 space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Video de referencia</h2>
          <YouTubePlayerModal url={ex.youtubeUrl} title={ex.name} compact />
        </div>
      )}

      {ex.description ? (
        <div className="border border-border bg-card p-5 space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Descripción</h2>
          <p className="text-sm leading-relaxed">{ex.description}</p>
        </div>
      ) : (
        <div className="border border-dashed border-border p-5 text-center text-muted-foreground">
          <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin descripción aún</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => onEdit(ex)}>
            Añadir descripción
          </Button>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ exercise: ex, onView, onEdit, onDelete }: {
  exercise: Exercise
  onView: (exercise: Exercise) => void
  onEdit: (exercise: Exercise) => void
  onDelete: (id: number) => void
}) {
  return (
    <div
      className="group relative flex flex-col bg-card border border-border cursor-pointer hover:border-foreground/40 transition-colors"
      style={{ borderLeft: '3px solid #a855f7' }}
      onClick={() => onView(ex)}
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          aria-label="Editar ejercicio"
          onClick={(e) => { e.stopPropagation(); onEdit(ex) }}
          className="h-7 w-7 flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Eliminar ejercicio"
          onClick={(e) => { e.stopPropagation(); onDelete(ex.id) }}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400" style={{ fontFamily: 'var(--font-mono)' }}>
          {CATEGORY_LABELS[ex.category]}
        </span>
        <p className="text-sm font-semibold leading-snug pr-16">{ex.name}</p>
        {ex.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{ex.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', color: EQUIPMENT_ACCENT[ex.equipment] }}>
          {EQUIPMENT_LABELS[ex.equipment]}
        </span>
        {ex.youtubeUrl && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <Play className="h-2.5 w-2.5" strokeWidth={1.5} />
            VIDEO
          </span>
        )}
      </div>
    </div>
  )
}

export function MobilidadEjerciciosPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [viewing, setViewing] = useState<Exercise | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery)

  const { data, isLoading, error } = useExercises({
    category: 'MOBILITY',
    page: currentPage,
    size: 24,
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(0)
  }

  const filteredExercises = debouncedSearch
    ? (data?.content ?? []).filter((ex) =>
        ex.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ex.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : (data?.content ?? [])

  const createMutation = useCreateExercise()
  const updateMutation = useUpdateExercise()
  const deleteMutation = useDeleteExercise()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreateExerciseForm) => {
    const payload = { ...formData, youtubeUrl: formData.youtubeUrl || undefined }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setOpen(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar este ejercicio? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
    if (viewing?.id === id) setViewing(null)
  }

  const handleEdit = (exercise: Exercise) => {
    setEditing(exercise)
    setOpen(true)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  if (viewing) {
    return (
      <>
        <ExerciseDetailView
          exercise={viewing}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={() => setViewing(null)}
        />
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar ejercicio</DialogTitle>
            </DialogHeader>
            <ExerciseForm
              defaultValues={editing ?? undefined}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Estudio
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Movilidad
          </h1>
        </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Nuevo
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar ejercicio' : 'Nuevo ejercicio'}</DialogTitle>
            </DialogHeader>
            <ExerciseForm
              defaultValues={editing ?? undefined}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
            </DialogContent>
          </Dialog>
      </div>

      {/* Buscador */}
      <SearchInput
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Buscar ejercicios de movilidad..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar ejercicios</AlertDescription>
        </Alert>
      ) : filteredExercises.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <Dumbbell className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : 'No hay ejercicios de movilidad'}</p>
          {!debouncedSearch && <p className="text-xs mt-1">Añade tu primer drill o ejercicio de movilidad</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredExercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onView={setViewing}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {!debouncedSearch && <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  )
}
