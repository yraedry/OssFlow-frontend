import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { TechniqueCard } from '../components/TechniqueCard'
import { TechniqueForm } from '../components/TechniqueForm'
import { useTechniques, useCreateTechnique, useUpdateTechnique, useDeleteTechnique } from '../hooks'
import type { Technique } from '../types'
import type { CreateTechniqueForm } from '../schemas'

export function TechniquesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Technique | null>(null)

  const { data, isLoading, error } = useTechniques()
  const createMutation = useCreateTechnique()
  const updateMutation = useUpdateTechnique()
  const deleteMutation = useDeleteTechnique()

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
    if (!confirm('¿Eliminar esta técnica?')) return
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

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar técnicas</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay técnicas todavía.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
