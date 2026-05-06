import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createStudyBlockSchema, type CreateStudyBlockForm } from '../schemas'

type StudyBlockFormProps = {
  onSubmit: (data: CreateStudyBlockForm) => void
  isPending?: boolean
}

export function StudyBlockForm({ onSubmit, isPending }: StudyBlockFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudyBlockForm>({
    resolver: zodResolver(createStudyBlockSchema),
    defaultValues: { title: '', description: '', orderIndex: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="block-title">Título</Label>
        <Input id="block-title" {...register('title')} placeholder="Semana 1 - Guardia" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="block-description">Descripción</Label>
        <Textarea
          id="block-description"
          {...register('description')}
          placeholder="Descripción del bloque..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="block-week">Semana (opcional)</Label>
        <Input
          id="block-week"
          type="number"
          min={1}
          {...register('weekNumber', { valueAsNumber: true })}
          placeholder="1"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Crear bloque'}
      </Button>
    </form>
  )
}
