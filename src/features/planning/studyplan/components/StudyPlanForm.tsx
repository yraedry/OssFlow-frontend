import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createStudyPlanSchema, type CreateStudyPlanForm } from '../schemas'
import type { StudyPlan } from '../types'

type StudyPlanFormProps = {
  defaultValues?: Partial<StudyPlan>
  onSubmit: (data: CreateStudyPlanForm) => void
  isPending?: boolean
}

export function StudyPlanForm({ defaultValues, onSubmit, isPending }: StudyPlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudyPlanForm>({
    resolver: zodResolver(createStudyPlanSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      startDate: defaultValues?.startDate ?? '',
      endDate: defaultValues?.endDate ?? '',
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
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción del plan..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha fin (opcional)</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear plan'}
      </Button>
    </form>
  )
}
