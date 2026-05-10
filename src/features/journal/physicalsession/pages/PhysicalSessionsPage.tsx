import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PhysicalSessionCard } from '../components/PhysicalSessionCard'
import { PhysicalSessionForm } from '../components/PhysicalSessionForm'
import { usePhysicalSessions, useCreatePhysicalSession, useUpdatePhysicalSession, useDeletePhysicalSession } from '../hooks'
import type { CreatePhysicalSessionForm } from '../schemas'
import type { PhysicalSession } from '../types'
import { PHYSICAL_SESSION_TYPE_LABELS } from '../types'

const TYPE_COLORS: Record<string, string> = {
  STRENGTH: '#f59e0b',
  CARDIO: '#10b981',
  FLEXIBILITY: '#a855f7',
  MOBILITY: '#3b82f6',
  HIIT: '#e11d48',
  OTHER: '#6b7280',
}

export function PhysicalSessionsPage() {
  const [open, setOpen] = useState(false)
  const [editSession, setEditSession] = useState<PhysicalSession | null>(null)
  const [detailSession, setDetailSession] = useState<PhysicalSession | null>(null)
  const { data, isLoading, error } = usePhysicalSessions()
  const createMutation = useCreatePhysicalSession()
  const updateMutation = useUpdatePhysicalSession()
  const deleteMutation = useDeletePhysicalSession()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreatePhysicalSessionForm) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleUpdate = async (formData: CreatePhysicalSessionForm) => {
    if (!editSession) return
    await updateMutation.mutateAsync({ id: editSession.id, data: formData })
    setEditSession(null)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar esta sesión? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const sessions = (data?.content ?? []).filter(s => s.sessionType !== 'MOBILITY' && s.sessionType !== 'FLEXIBILITY')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Diario</div>
          <h1 className="text-2xl font-black leading-none" style={{ fontFamily: 'var(--font-serif)' }}>Sesiones físicas</h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.totalElements ?? 0} sesiones en total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Nueva
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva sesión física</DialogTitle>
            </DialogHeader>
            <PhysicalSessionForm onSubmit={handleSubmit} isPending={createMutation.isPending} excludeTypes={['MOBILITY', 'FLEXIBILITY']} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar las sesiones</AlertDescription></Alert>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay sesiones físicas todavía.</p>
          <p className="text-sm">Registra tu primera sesión con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {sessions.map((s) => (
            <div key={s.id} id={`session-${s.id}`} className="self-start">
              <PhysicalSessionCard session={s} onEdit={setEditSession} onDelete={handleDelete} onDetail={setDetailSession} />
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editSession} onOpenChange={v => { if (!v) setEditSession(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar sesión física</DialogTitle>
          </DialogHeader>
          {editSession && (
            <PhysicalSessionForm
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              defaultValues={{
                sessionDate: editSession.sessionDate,
                sessionType: editSession.sessionType,
                title: editSession.title,
                durationMinutes: editSession.durationMinutes ?? undefined,
                notes: editSession.notes ?? undefined,
              }}
              submitLabel="Guardar cambios"
              excludeTypes={['MOBILITY', 'FLEXIBILITY']}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailSession} onOpenChange={v => { if (!v) setDetailSession(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Detalle de sesión física</DialogTitle>
          </DialogHeader>
          {detailSession && (() => {
            const accent = TYPE_COLORS[detailSession.sessionType] ?? '#6b7280'
            return (
              <div className="space-y-4 overflow-y-auto max-h-[75vh] min-w-0">
                <div className="border-l-2 pl-3" style={{ borderColor: accent }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent, fontFamily: 'var(--font-mono)' }}>
                    {PHYSICAL_SESSION_TYPE_LABELS[detailSession.sessionType]}
                  </span>
                  <p className="text-base font-semibold mt-0.5 break-words" style={{ fontFamily: 'var(--font-serif)' }}>{detailSession.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    {detailSession.sessionDate}{detailSession.durationMinutes ? ` · ${detailSession.durationMinutes} min` : ''}
                  </p>
                </div>
                {detailSession.notes && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Notas</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{detailSession.notes}</p>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
