import { useState } from 'react'
import { Plus, Dumbbell } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Trash2 } from 'lucide-react'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { useTrainingSessions, useCreateTrainingSession, useDeleteTrainingSession } from '../hooks'
import { createTrainingSessionSchema, type CreateTrainingSessionForm } from '../schemas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Intensity } from '../types'

const INTENSITY_LABELS: Record<Intensity, string> = {
  LOW: 'Baja', MODERATE: 'Moderada', HIGH: 'Alta', COMPETITION: 'Competición',
}
const INTENSITY_COLORS: Record<Intensity, string> = {
  LOW: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  COMPETITION: 'bg-red-100 text-red-800',
}

export function TrainingSessionsPage() {
  const [open, setOpen] = useState(false)
  const { data, isLoading, error } = useTrainingSessions()
  const createMutation = useCreateTrainingSession()
  const deleteMutation = useDeleteTrainingSession()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CreateTrainingSessionForm>({
    resolver: zodResolver(createTrainingSessionSchema),
    defaultValues: { sessionDate: new Date().toISOString().split('T')[0], durationMinutes: 90, intensity: 'MODERATE' },
  })

  const onSubmit = async (data: CreateTrainingSessionForm) => {
    await createMutation.mutateAsync({ ...data, durationMinutes: Number(data.durationMinutes) })
    setOpen(false)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesiones de entrenamiento</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} sesiones registradas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nueva sesión</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nueva sesión de entrenamiento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Controller control={control} name="sessionDate" render={({ field }) => (
                    <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Seleccionar fecha" />
                  )} />
                  {errors.sessionDate && <p className="text-sm text-destructive">{errors.sessionDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duración (min)</Label>
                  <Input id="durationMinutes" type="number" {...register('durationMinutes', { valueAsNumber: true })} />
                  {errors.durationMinutes && <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Gimnasio (opcional)</Label>
                <Input id="location" {...register('location')} placeholder="Gym Central" />
              </div>
              <div className="space-y-2">
                <Label>Intensidad</Label>
                <Controller control={control} name="intensity" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTENSITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notesMarkdown">Notas</Label>
                <Textarea id="notesMarkdown" {...register('notesMarkdown')} rows={3} placeholder="Trabajamos guard passing..." />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Guardando...' : 'Crear sesión'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar sesiones</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No hay sesiones registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.content ?? []).filter(Boolean).map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {s.sessionDate ? format(new Date(s.sessionDate), "d MMM yyyy", { locale: es }) : 'Sin fecha'}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => { if (confirm('¿Eliminar sesión?')) deleteMutation.mutate(s.id) }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${INTENSITY_COLORS[s.intensity]}`}>
                    {INTENSITY_LABELS[s.intensity]}
                  </span>
                  <Badge variant="outline">{s.durationMinutes} min</Badge>
                  {s.location && <Badge variant="outline">{s.location}</Badge>}
                </div>
                {s.notesMarkdown && <p className="text-sm text-muted-foreground line-clamp-2">{s.notesMarkdown}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
