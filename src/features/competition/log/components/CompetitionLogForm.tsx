import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createCompetitionLogSchema, type CreateCompetitionLogForm } from '../schemas'
import type { CompetitionLog } from '../types'

type CompetitionLogFormProps = {
  defaultValues?: Partial<CompetitionLog>
  onSubmit: (data: CreateCompetitionLogForm) => void
  isPending?: boolean
}

export function CompetitionLogForm({ defaultValues, onSubmit, isPending }: CompetitionLogFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCompetitionLogForm>({
    resolver: zodResolver(createCompetitionLogSchema),
    defaultValues: {
      eventName: defaultValues?.eventName ?? '',
      eventDate: defaultValues?.eventDate ?? '',
      location: defaultValues?.location ?? '',
      weightClass: defaultValues?.weightClass ?? '',
      modality: defaultValues?.modality ?? 'GI',
      result: defaultValues?.result ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventName">Nombre del evento</Label>
        <Input id="eventName" {...register('eventName')} placeholder="Copa BJJ Madrid 2026" />
        {errors.eventName && (
          <p className="text-sm text-destructive">{errors.eventName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Fecha</Label>
          <Input id="eventDate" type="date" {...register('eventDate')} />
          {errors.eventDate && (
            <p className="text-sm text-destructive">{errors.eventDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="modality">Modalidad</Label>
          <Controller
            name="modality"
            control={control}
            render={({ field }) => (
              <select
                id="modality"
                value={field.value}
                onChange={field.onChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="GI">GI</option>
                <option value="NOGI">NOGI</option>
                <option value="BOTH">BOTH</option>
              </select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" {...register('location')} placeholder="Madrid, España" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightClass">Categoría de peso</Label>
          <Input id="weightClass" {...register('weightClass')} placeholder="-76 kg" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="result">Resultado general</Label>
        <Input id="result" {...register('result')} placeholder="1er puesto, Campeón..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observaciones sobre la competencia..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear competencia'}
      </Button>
    </form>
  )
}
