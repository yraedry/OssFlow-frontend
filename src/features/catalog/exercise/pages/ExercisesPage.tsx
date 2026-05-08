import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { YouTubeEmbed } from '@/shared/components/ui/youtube-embed'
import { ExerciseForm } from '../components/ExerciseForm'
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '../hooks'
import type { Exercise, ExerciseCategory, EquipmentType } from '../types'
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '../types'
import type { CreateExerciseForm } from '../schemas'

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  STRENGTH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  CARDIO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  FLEXIBILITY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CORE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  MOBILITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const EQUIPMENT_COLORS: Record<EquipmentType, string> = {
  NO_EQUIPMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  HOME: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  GYM: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
}

type FilterButtonProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

type ExerciseCardProps = {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDelete: (id: number) => void
}

function ExerciseCard({ exercise: ex, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{ex.name}</CardTitle>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(ex)}
              aria-label="Editar ejercicio"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(ex.id)}
              aria-label="Eliminar ejercicio"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[ex.category]}`}>
            {CATEGORY_LABELS[ex.category]}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${EQUIPMENT_COLORS[ex.equipment]}`}>
            {EQUIPMENT_LABELS[ex.equipment]}
          </span>
          {ex.visibility === 'PRIVATE' && (
            <Badge variant="outline" className="text-xs">Privado</Badge>
          )}
        </div>
        {ex.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ex.description}</p>
        )}
        {ex.youtubeUrl && (
          <div className="mt-2 flex justify-end">
            <YouTubeEmbed url={ex.youtubeUrl} title={ex.name} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ExercisesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | undefined>()
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | undefined>()
  const [currentPage, setCurrentPage] = useState(0)

  const { data, isLoading, error } = useExercises({
    category: categoryFilter,
    equipment: equipmentFilter,
    page: currentPage,
    size: 20,
  })

  const createMutation = useCreateExercise()
  const updateMutation = useUpdateExercise()
  const deleteMutation = useDeleteExercise()

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
    if (!confirm('¿Eliminar este ejercicio?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleEdit = (exercise: Exercise) => {
    setEditing(exercise)
    setOpen(true)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  const toggleCategory = (cat: ExerciseCategory) => {
    setCategoryFilter(prev => (prev === cat ? undefined : cat))
    setCurrentPage(0)
  }

  const toggleEquipment = (eq: EquipmentType) => {
    setEquipmentFilter(prev => (prev === eq ? undefined : eq))
    setCurrentPage(0)
  }

  const categories = Object.keys(CATEGORY_LABELS) as ExerciseCategory[]
  const equipments = Object.keys(EQUIPMENT_LABELS) as EquipmentType[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ejercicios físicos</h1>
          <p className="text-muted-foreground text-sm">
            {data?.totalElements ?? 0} ejercicios en tu catálogo
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo ejercicio
            </Button>
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

      {/* Filtros */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider w-20">Equip.</span>
          <FilterButton active={equipmentFilter === undefined} onClick={() => { setEquipmentFilter(undefined); setCurrentPage(0) }}>
            Todos
          </FilterButton>
          {equipments.map((eq) => (
            <FilterButton
              key={eq}
              active={equipmentFilter === eq}
              onClick={() => toggleEquipment(eq)}
            >
              {EQUIPMENT_LABELS[eq]}
            </FilterButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider w-20">Cat.</span>
          <FilterButton active={categoryFilter === undefined} onClick={() => { setCategoryFilter(undefined); setCurrentPage(0) }}>
            Todos
          </FilterButton>
          {categories.map((cat) => (
            <FilterButton
              key={cat}
              active={categoryFilter === cat}
              onClick={() => toggleCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar ejercicios</AlertDescription>
        </Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay ejercicios todavía.</p>
          <p className="text-sm mt-1">Crea tu primer ejercicio con el botón de arriba.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.content ?? []).map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
