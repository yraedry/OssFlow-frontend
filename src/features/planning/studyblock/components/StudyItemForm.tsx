import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createStudyItemSchema, type CreateStudyItemForm } from '@/features/planning/studyitem/schemas'

type StudyItemFormProps = {
  onSubmit: (data: CreateStudyItemForm) => void
  isPending?: boolean
}

export function StudyItemForm({ onSubmit, isPending }: StudyItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudyItemForm>({
    resolver: zodResolver(createStudyItemSchema),
    defaultValues: { title: '', description: '', orderIndex: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="item-title">Título</Label>
        <Input id="item-title" {...register('title')} placeholder="Técnica de barrida..." />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-description">Descripción</Label>
        <Textarea
          id="item-description"
          {...register('description')}
          placeholder="Descripción del ítem..."
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Añadir ítem'}
      </Button>
    </form>
  )
}
