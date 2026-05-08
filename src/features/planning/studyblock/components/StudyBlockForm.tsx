import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { createStudyBlockSchema, type CreateStudyBlockForm } from '../schemas'

type StudyBlockFormProps = {
  onSubmit: (data: CreateStudyBlockForm) => void
  isPending?: boolean
  defaultValues?: Partial<CreateStudyBlockForm>
}

export function StudyBlockForm({ onSubmit, isPending, defaultValues }: StudyBlockFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateStudyBlockForm>({
    resolver: zodResolver(createStudyBlockSchema),
    defaultValues: { title: '', blockOrder: 0, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="block-title">Título *</Label>
        <Input id="block-title" {...register('title')} placeholder="Semana 1 — Guardia cerrada" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha inicio (opcional)</Label>
          <Controller control={control} name="startDate" render={({ field }) => (
            <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Inicio" />
          )} />
        </div>
        <div className="space-y-2">
          <Label>Fecha fin (opcional)</Label>
          <Controller control={control} name="endDate" render={({ field }) => (
            <DatePicker value={field.value ?? ''} onChange={field.onChange} placeholder="Fin" />
          )} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="block-order">Orden</Label>
        <Input id="block-order" type="number" min={0} {...register('blockOrder', { valueAsNumber: true })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notesMarkdown">Notas (opcional)</Label>
        <Textarea id="notesMarkdown" {...register('notesMarkdown')} rows={3} placeholder="Objetivos de este bloque..." />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.title ? 'Actualizar bloque' : 'Crear bloque'}
      </Button>
    </form>
  )
}
