import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { SystemCard } from '../components/SystemCard'
import { SystemForm } from '../components/SystemForm'
import { useSystems, useCreateSystem, useUpdateSystem, useDeleteSystem } from '../hooks'
import type { System } from '../types'
import type { CreateSystemForm } from '../schemas'

export function SystemsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<System | null>(null)

  const { data, isLoading, error } = useSystems()
  const createMutation = useCreateSystem()
  const updateMutation = useUpdateSystem()
  const deleteMutation = useDeleteSystem()

  const handleSubmit = async (formData: CreateSystemForm) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setOpen(false)
    setEditing(null)
  }

  const handleEdit = (system: System) => {
    setEditing(system)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este sistema?')) return
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
          <h1 className="text-2xl font-bold">Sistemas</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} sistemas en tu catálogo</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Sistema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar sistema' : 'Nuevo Sistema'}</DialogTitle>
            </DialogHeader>
            <SystemForm
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
        <Alert variant="destructive">
          <AlertDescription>Error al cargar los sistemas</AlertDescription>
        </Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay sistemas todavía.</p>
          <p className="text-sm">Crea tu primer sistema con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.content ?? []).map((s) => (
            <SystemCard key={s.id} system={s} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
