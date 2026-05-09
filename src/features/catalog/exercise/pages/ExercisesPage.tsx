import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, Pencil, Trash2, Dumbbell, PlayCircle, ArrowLeft, Package, Home, Building2 } from 'lucide-react'
import { YouTubePlayerModal } from '@/shared/components/ui/youtube-player-modal'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
import type { Exercise, ExerciseCategory, EquipmentType } from '../types'
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '../types'
import type { CreateExerciseForm } from '../schemas'
import { getYouTubeEmbedId } from '@/shared/utils/youtube'

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  STRENGTH:    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  CARDIO:      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  FLEXIBILITY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CORE:        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  MOBILITY:    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OTHER:       'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const EQUIPMENT_COLORS: Record<EquipmentType, string> = {
  NO_EQUIPMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  HOME:         'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  GYM:          'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function CategoryBadge({ category }: { category: ExerciseCategory }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  )
}

function EquipmentBadge({ equipment }: { equipment: EquipmentType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${EQUIPMENT_COLORS[equipment]}`}>
      {EQUIPMENT_LABELS[equipment]}
    </span>
  )
}

// Vista de detalle completo del ejercicio
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
          Ejercicios
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{ex.name}</h1>
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={ex.category} />
            <EquipmentBadge equipment={ex.equipment} />
            {ex.visibility === 'PRIVATE' && (
              <Badge variant="outline" className="text-xs">Privado</Badge>
            )}
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
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Video de referencia</h2>
          <YouTubePlayerModal url={ex.youtubeUrl} title={ex.name} />
        </div>
      )}

      {/* Descripción completa */}
      {ex.description ? (
        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Descripción</h2>
          <p className="text-sm leading-relaxed">{ex.description}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border border-dashed p-5 text-center text-muted-foreground">
          <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin descripción aún</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => onEdit(ex)}>
            Añadir descripción
          </Button>
        </div>
      )}

      {/* Equivalencias de material */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Material necesario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-lg p-3 space-y-1 border-2 transition-colors ${
            ex.equipment === 'NO_EQUIPMENT' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-muted/30'
          }`}>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold">Sin material</span>
              {ex.equipment === 'NO_EQUIPMENT' && <span className="ml-auto text-xs text-emerald-400 font-mono">✓ Este</span>}
            </div>
            <p className="text-xs text-muted-foreground">Solo el peso corporal. Puedes hacerlo en cualquier sitio.</p>
          </div>
          <div className={`rounded-lg p-3 space-y-1 border-2 transition-colors ${
            ex.equipment === 'HOME' ? 'border-sky-500 bg-sky-500/10' : 'border-border bg-muted/30'
          }`}>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-semibold">En casa</span>
              {ex.equipment === 'HOME' && <span className="ml-auto text-xs text-sky-400 font-mono">✓ Este</span>}
            </div>
            <p className="text-xs text-muted-foreground">Material básico: banda elástica, mancuerna, silla o pared.</p>
          </div>
          <div className={`rounded-lg p-3 space-y-1 border-2 transition-colors ${
            ex.equipment === 'GYM' ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-muted/30'
          }`}>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold">Gimnasio</span>
              {ex.equipment === 'GYM' && <span className="ml-auto text-xs text-violet-400 font-mono">✓ Este</span>}
            </div>
            <p className="text-xs text-muted-foreground">Requiere máquinas o equipamiento de gym.</p>
          </div>
        </div>
        {ex.equipment === 'GYM' && (
          <p className="text-xs text-muted-foreground pt-1">
            💡 <strong>Sin gym:</strong> busca una variante con banda elástica o con peso corporal del mismo patrón de movimiento.
          </p>
        )}
        {ex.equipment === 'HOME' && (
          <p className="text-xs text-muted-foreground pt-1">
            💡 <strong>Sin material:</strong> puedes adaptar este ejercicio usando solo tu peso corporal ajustando el ángulo o el tempo.
          </p>
        )}
      </div>
    </div>
  )
}

type ExerciseCardProps = {
  exercise: Exercise
  onView: (exercise: Exercise) => void
  onEdit: (exercise: Exercise) => void
  onDelete: (id: number) => void
}

function ExerciseCard({ exercise: ex, onView, onEdit, onDelete }: ExerciseCardProps) {
  const youtubeId = ex.youtubeUrl ? getYouTubeEmbedId(ex.youtubeUrl) : null

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(ex)}
    >
      {/* Thumbnail del video si existe */}
      {youtubeId && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
            alt={ex.name}
            className="w-full h-28 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 right-2">
            <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded font-mono">
              <PlayCircle className="h-3 w-3" />
              Video
            </span>
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{ex.name}</CardTitle>
          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(ex)}
              aria-label="Editar"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(ex.id)}
              aria-label="Eliminar"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={ex.category} />
          <EquipmentBadge equipment={ex.equipment} />
        </div>
        {ex.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{ex.description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function ExercisesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [viewing, setViewing] = useState<Exercise | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | undefined>()
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | undefined>()
  const [currentPage, setCurrentPage] = useState(0)

  const { data, isLoading, error } = useExercises({
    category: categoryFilter,
    equipment: equipmentFilter,
    page: currentPage,
    size: 24,
  })

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

  // Vista de detalle
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
            <FilterButton key={eq} active={equipmentFilter === eq} onClick={() => toggleEquipment(eq)}>
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
            <FilterButton key={cat} active={categoryFilter === cat} onClick={() => toggleCategory(cat)}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(data?.content ?? []).map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onView={setViewing}
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
