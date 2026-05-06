import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { createPositionSchema, type CreatePositionForm } from '../schemas'
import type { Position } from '../types'

interface PositionFormProps {
  defaultValues?: Partial<Position>
  onSubmit: (data: CreatePositionForm) => void
  isPending?: boolean
}

export function PositionForm({ defaultValues, onSubmit, isPending }: PositionFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreatePositionForm>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? 'NEUTRAL',
      visibility: defaultValues?.visibility ?? 'PRIVATE',
      description: defaultValues?.description ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} placeholder="Guardia cerrada" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={watch('type')} onValueChange={(v) => setValue('type', v as CreatePositionForm['type'])}>
          <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TOP">Top</SelectItem>
            <SelectItem value="BOTTOM">Bottom</SelectItem>
            <SelectItem value="NEUTRAL">Neutral</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Visibilidad</Label>
        <Select value={watch('visibility')} onValueChange={(v) => setValue('visibility', v as CreatePositionForm['visibility'])}>
          <SelectTrigger><SelectValue placeholder="Seleccionar visibilidad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">Pública</SelectItem>
            <SelectItem value="PRIVATE">Privada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...register('description')} placeholder="Descripción de la posición..." rows={3} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear posición'}
      </Button>
    </form>
  )
}
