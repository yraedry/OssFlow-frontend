import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PhysicalSessionCard } from '../components/PhysicalSessionCard'
import { PhysicalSessionForm } from '../components/PhysicalSessionForm'
import { usePhysicalSessions, useCreatePhysicalSession, useDeletePhysicalSession } from '../hooks'
import type { CreatePhysicalSessionForm } from '../schemas'

export function MobilidadPage() {
  const [open, setOpen] = useState(false)
  const { data, isLoading, error } = usePhysicalSessions()
  const createMutation = useCreatePhysicalSession()
  const deleteMutation = useDeletePhysicalSession()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreatePhysicalSessionForm) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar esta sesión? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const sessions = (data?.content ?? []).filter((s) => s.sessionType === 'MOBILITY')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
            Movilidad
          </h1>
          <p className="text-muted-foreground text-sm">Sesiones de movilidad específica para BJJ</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva sesión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva sesión de movilidad</DialogTitle>
            </DialogHeader>
            <PhysicalSessionForm
              onSubmit={handleSubmit}
              isPending={createMutation.isPending}
              defaultSessionType="MOBILITY"
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar las sesiones</AlertDescription></Alert>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay sesiones de movilidad todavía.</p>
          <p className="text-sm">Registra tu primera sesión con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <PhysicalSessionCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
