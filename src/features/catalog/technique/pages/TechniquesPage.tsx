import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { TechniqueForm } from '../components/TechniqueForm'
import { useTechniques, useCreateTechnique, useUpdateTechnique, useDeleteTechnique } from '../hooks'
import type { Technique } from '../types'
import type { CreateTechniqueForm } from '../schemas'

const BELT_COLORS: Record<Technique['belt'], string> = {
  WHITE: 'bg-gray-100 text-gray-800',
  BLUE: 'bg-blue-100 text-blue-800',
  PURPLE: 'bg-purple-100 text-purple-800',
  BROWN: 'bg-amber-900 text-amber-100',
  BLACK: 'bg-gray-900 text-gray-100',
}

const BELT_LABELS: Record<Technique['belt'], string> = {
  WHITE: 'Blanco', BLUE: 'Azul', PURPLE: 'Morado', BROWN: 'Marrón', BLACK: 'Negro',
}

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

  const handleOpenChange = (o: boolean) => { setOpen(o); if (!o) setEditing(null) }

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>
  if (error) return <Alert variant="destructive"><AlertDescription>Error al cargar técnicas</AlertDescription></Alert>

  const techniques = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Técnicas</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} técnicas en tu catálogo</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2" />Nueva técnica</Button>
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

      {techniques.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay técnicas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techniques.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BELT_COLORS[t.belt]}`}>
                    {BELT_LABELS[t.belt]}
                  </span>
                  <Badge variant="secondary">{t.modality}</Badge>
                </div>
                {t.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
