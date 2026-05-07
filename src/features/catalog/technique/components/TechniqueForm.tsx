import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { createTechniqueSchema, type CreateTechniqueForm } from '../schemas'
import type { Technique } from '../types'
import { usePositions } from '@/features/catalog/position/hooks'

interface TechniqueFormProps {
  defaultValues?: Partial<Technique>
  onSubmit: (data: CreateTechniqueForm) => void
  isPending?: boolean
}

const BELT_LABELS = { WHITE: 'Blanco', BLUE: 'Azul', PURPLE: 'Morado', BROWN: 'Marrón', BLACK: 'Negro' }
const MODALITY_LABELS = { GI: 'Gi', NOGI: 'No-Gi', BOTH: 'Ambas' }
const CATEGORY_LABELS = {
  SUBMISSION: 'Sumisión', SWEEP: 'Barrido', PASS: 'Pasada de guardia',
  TAKEDOWN: 'Derribo', ESCAPE: 'Escape', TRANSITION: 'Transición',
}

export function TechniqueForm({ defaultValues, onSubmit, isPending }: TechniqueFormProps) {
  const { data: positionsData } = usePositions({ size: 200 })
  const positions = positionsData?.content ?? []

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateTechniqueForm>({
    resolver: zodResolver(createTechniqueSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      category: defaultValues?.category ?? 'SUBMISSION',
      startPositionId: defaultValues?.startPositionId,
      endPositionId: defaultValues?.endPositionId,
      minimumBelt: defaultValues?.minimumBelt ?? 'WHITE',
      modality: defaultValues?.modality ?? 'GI',
      visibility: defaultValues?.visibility ?? 'PRIVATE',
      description: defaultValues?.description ?? '',
      youtubeUrl: defaultValues?.youtubeUrl ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} placeholder="Armbar desde guardia" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Categoría *</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
              <SelectContent position="popper">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Posición de inicio *</Label>
        <Controller
          control={control}
          name="startPositionId"
          render={({ field }) => (
            <Select
              value={field.value?.toString()}
              onValueChange={(v) => field.onChange(parseInt(v))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar posición" /></SelectTrigger>
              <SelectContent position="popper">
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.startPositionId && <p className="text-sm text-destructive">{errors.startPositionId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cinturón mínimo</Label>
          <Controller
            control={control}
            name="minimumBelt"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {Object.entries(BELT_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Modalidad</Label>
          <Controller
            control={control}
            name="modality"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {Object.entries(MODALITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Visibilidad</Label>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="PUBLIC">Pública</SelectItem>
                <SelectItem value="PRIVATE">Privada</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtubeUrl">URL YouTube (opcional)</Label>
        <Input id="youtubeUrl" {...register('youtubeUrl')} placeholder="https://youtube.com/watch?v=..." />
        {errors.youtubeUrl && <p className="text-sm text-destructive">{errors.youtubeUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...register('description')} rows={3} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear técnica'}
      </Button>
    </form>
  )
}
