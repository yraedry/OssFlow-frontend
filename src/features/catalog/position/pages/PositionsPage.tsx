import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SearchInput } from '@/shared/components/ui/search-input'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { PositionCard } from '../components/PositionCard'
import { PositionForm } from '../components/PositionForm'
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from '../hooks'
import type { Position } from '../types'
import type { CreatePositionForm } from '../schemas'

export function PositionsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Position | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(0)
  }

  const { data, isLoading, error } = usePositions({
    page: currentPage,
    size: 20,
    search: debouncedSearch || undefined,
  })
  const createMutation = useCreatePosition()
  const updateMutation = useUpdatePosition()
  const deleteMutation = useDeletePosition()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreatePositionForm) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setOpen(false)
    setEditing(null)
  }

  const handleEdit = (position: Position) => {
    setEditing(position)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar esta posición? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Estudio
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Posiciones
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
                Nueva
              </button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar posición' : 'Nueva posición'}</DialogTitle>
            </DialogHeader>
            <PositionForm
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
        placeholder="Buscar posiciones..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar las posiciones</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <p className="text-sm font-medium">{debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : 'No hay posiciones todavía'}</p>
          {!debouncedSearch && <p className="text-xs mt-1">Crea tu primera posición con el botón de arriba</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.content ?? []).map((p) => (
              <PositionCard key={p.id} position={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
