import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { createStudyPlanSchema, type CreateStudyPlanForm, type CreateStudyPlanFormOutput } from '../schemas'
import type { StudyPlan } from '../types'

type StudyPlanFormProps = {
  defaultValues?: Partial<StudyPlan>
  onSubmit: (data: CreateStudyPlanFormOutput) => void
  isPending?: boolean
}

export function StudyPlanForm({ defaultValues, onSubmit, isPending }: StudyPlanFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateStudyPlanForm, unknown, CreateStudyPlanFormOutput>({
    resolver: zodResolver(createStudyPlanSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      goalMarkdown: defaultValues?.goalMarkdown ?? '',
      startDate: defaultValues?.startDate ?? '',
      endDate: defaultValues?.endDate ?? '',
      status: defaultValues?.status ?? 'DRAFT',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register('title')} placeholder="Plan de verano BJJ" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalMarkdown">Descripción / Objetivo</Label>
        <Textarea
          id="goalMarkdown"
          {...register('goalMarkdown')}
          placeholder="Objetivos del plan..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha inicio</Label>
          <Controller control={control} name="startDate" render={({ field }) => (
            <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Seleccionar fecha" />
          )} />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Fecha fin (opcional)</Label>
          <Controller control={control} name="endDate" render={({ field }) => (
            <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Sin fecha de fin" />
          )} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear plan'}
      </Button>
    </form>
  )
}
