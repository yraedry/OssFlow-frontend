import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PositionCard } from '../components/PositionCard'
import { PositionForm } from '../components/PositionForm'
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from '../hooks'
import type { Position } from '../types'
import type { CreatePositionForm } from '../schemas'

export function PositionsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Position | null>(null)

  const { data, isLoading, error } = usePositions()
  const createMutation = useCreatePosition()
  const updateMutation = useUpdatePosition()
  const deleteMutation = useDeletePosition()

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
    if (!confirm('¿Eliminar esta posición?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posiciones</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} posiciones en tu catálogo</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2" />Nueva posición</Button>
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

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar las posiciones</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay posiciones todavía.</p>
          <p className="text-sm">Crea tu primera posición con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.content ?? []).map((p) => (
            <PositionCard key={p.id} position={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
