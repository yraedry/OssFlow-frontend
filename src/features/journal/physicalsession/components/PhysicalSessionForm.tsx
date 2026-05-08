import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { createPhysicalSessionSchema, type CreatePhysicalSessionForm } from '../schemas'
import { PHYSICAL_SESSION_TYPE_LABELS } from '../types'

type Props = {
  onSubmit: (data: CreatePhysicalSessionForm) => Promise<void>
  isPending: boolean
  defaultSessionType?: CreatePhysicalSessionForm['sessionType']
}

const SESSION_TYPES = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'MOBILITY', 'HIIT', 'OTHER'] as const

export function PhysicalSessionForm({ onSubmit, isPending, defaultSessionType }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreatePhysicalSessionForm>({
    resolver: zodResolver(createPhysicalSessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: defaultSessionType ?? 'STRENGTH',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sessionDate">Fecha</Label>
        <Controller
          control={control}
          name="sessionDate"
          render={({ field }) => (
            <DatePicker value={field.value} onChange={field.onChange} placeholder="Seleccionar fecha" />
          )}
        />
        {errors.sessionDate && <p className="text-xs text-destructive mt-1">{errors.sessionDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sessionType">Tipo</Label>
        <Controller
          control={control}
          name="sessionType"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{PHYSICAL_SESSION_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sessionType && <p className="text-xs text-destructive mt-1">{errors.sessionType.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register('title')} placeholder="Ej: Fuerza — Empuje" />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationMinutes">Duración (minutos)</Label>
        <Input
          id="durationMinutes"
          type="number"
          {...register('durationMinutes', { valueAsNumber: true })}
          placeholder="60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">URL YouTube (opcional)</Label>
        <Input
          id="youtubeUrl"
          type="url"
          {...register('youtubeUrl')}
          placeholder="https://youtube.com/watch?v=..."
        />
        {errors.youtubeUrl && <p className="text-xs text-destructive mt-1">{errors.youtubeUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Observaciones..." rows={3} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Guardar sesión'}
      </Button>
    </form>
  )
}
