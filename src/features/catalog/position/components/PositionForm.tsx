import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreatePositionForm>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? 'TOP',
      description: defaultValues?.description ?? '',
      youtubeUrl: defaultValues?.youtubeUrl ?? '',
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
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TOP">Top (encima)</SelectItem>
                <SelectItem value="BOTTOM">Bottom (abajo)</SelectItem>
                <SelectItem value="STANDING">De pie</SelectItem>
                <SelectItem value="GROUND_NEUTRAL">Neutral en suelo</SelectItem>
                <SelectItem value="SUBMITTED">Sometido</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">URL YouTube (opcional)</Label>
        <Input
          id="youtubeUrl"
          {...register('youtubeUrl')}
          placeholder="https://youtube.com/watch?v=..."
        />
        {errors.youtubeUrl && <p className="text-sm text-destructive">{errors.youtubeUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...register('description')} placeholder="Descripción de la posición..." rows={3} />
      </div>

      <button type="submit" disabled={isPending} className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        {isPending ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear posición'}
      </button>
    </form>
  )
}
