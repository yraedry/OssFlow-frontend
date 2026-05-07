import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { DatePicker } from '@/shared/components/ui/date-picker'
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
      weightCategory: defaultValues?.weightCategory ?? '',
      totalMatches: defaultValues?.totalMatches ?? undefined,
      result: defaultValues?.result ?? '',
      analysisMarkdown: defaultValues?.analysisMarkdown ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventName">Nombre del evento *</Label>
        <Input id="eventName" {...register('eventName')} placeholder="Copa BJJ Madrid 2026" />
        {errors.eventName && (
          <p className="text-sm text-destructive">{errors.eventName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha *</Label>
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} placeholder="Seleccionar fecha" />
            )}
          />
          {errors.eventDate && (
            <p className="text-sm text-destructive">{errors.eventDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightCategory">Categoría de peso</Label>
          <Input id="weightCategory" {...register('weightCategory')} placeholder="-76 kg" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalMatches">Total de combates</Label>
        <Input
          id="totalMatches"
          type="number"
          min={0}
          {...register('totalMatches', { valueAsNumber: true })}
          placeholder="5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="result">Resultado general</Label>
        <Input id="result" {...register('result')} placeholder="1er puesto, Campeón..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="analysisMarkdown">Análisis (Markdown)</Label>
        <Textarea
          id="analysisMarkdown"
          {...register('analysisMarkdown')}
          placeholder="Reflexiones sobre la competencia, qué funcionó, qué mejorar..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear competencia'}
      </Button>
    </form>
  )
}
