import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { TechniqueCard } from '../components/TechniqueCard'
import { TechniqueForm } from '../components/TechniqueForm'
import { useTechniques, useCreateTechnique, useUpdateTechnique, useDeleteTechnique } from '../hooks'
import type { Technique, TechniqueCategory } from '../types'
import type { CreateTechniqueForm } from '../schemas'

const CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  SUBMISSION: 'SUBMISSION',
  SWEEP: 'SWEEP',
  PASS: 'PASS',
  TAKEDOWN: 'TAKEDOWN',
  ESCAPE: 'ESCAPE',
  TRANSITION: 'TRANSITION',
}

const PAGE_SIZE = 20

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

export function TechniquesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Technique | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<TechniqueCategory | undefined>()

  const { data, isLoading, error } = useTechniques({
    page: currentPage,
    size: PAGE_SIZE,
    category: categoryFilter,
  })

  const createMutation = useCreateTechnique()
  const updateMutation = useUpdateTechnique()
  const deleteMutation = useDeleteTechnique()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreateTechniqueForm) => {
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
    const ok = await confirm({ description: '¿Eliminar esta técnica? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const handleEdit = (technique: Technique) => {
    setEditing(technique)
    setOpen(true)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  const toggleCategory = (cat: TechniqueCategory) => {
    setCategoryFilter(prev => (prev === cat ? undefined : cat))
    setCurrentPage(0)
  }

  const categories = Object.keys(CATEGORY_LABELS) as TechniqueCategory[]
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Técnicas</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} técnicas en tu catálogo</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva técnica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar técnica' : 'Nueva técnica'}</DialogTitle>
            </DialogHeader>
            <TechniqueForm
              defaultValues={editing ?? undefined}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider w-20">Cat.</span>
        <FilterButton active={categoryFilter === undefined} onClick={() => { setCategoryFilter(undefined); setCurrentPage(0) }}>
          Todas
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

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar técnicas</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay técnicas todavía.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.content ?? []).map((t) => (
              <TechniqueCard
                key={t.id}
                technique={t}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
