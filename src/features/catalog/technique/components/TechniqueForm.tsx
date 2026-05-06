import { useForm } from 'react-hook-form'
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

export function TechniqueForm({ defaultValues, onSubmit, isPending }: TechniqueFormProps) {
  const { data: positionsData } = usePositions({ size: 200 })
  const positions = positionsData?.content ?? []

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTechniqueForm>({
    resolver: zodResolver(createTechniqueSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      startPositionId: defaultValues?.startPositionId,
      endPositionId: defaultValues?.endPositionId,
      belt: defaultValues?.belt ?? 'WHITE',
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
        <Label>Posición de inicio *</Label>
        <Select
          value={watch('startPositionId')?.toString()}
          onValueChange={(v) => setValue('startPositionId', parseInt(v))}
        >
          <SelectTrigger><SelectValue placeholder="Seleccionar posición" /></SelectTrigger>
          <SelectContent>
            {positions.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.startPositionId && <p className="text-sm text-destructive">{errors.startPositionId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cinturón</Label>
          <Select value={watch('belt')} onValueChange={(v) => setValue('belt', v as CreateTechniqueForm['belt'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(BELT_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Modalidad</Label>
          <Select value={watch('modality')} onValueChange={(v) => setValue('modality', v as CreateTechniqueForm['modality'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(MODALITY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Visibilidad</Label>
        <Select value={watch('visibility')} onValueChange={(v) => setValue('visibility', v as CreateTechniqueForm['visibility'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">Pública</SelectItem>
            <SelectItem value="PRIVATE">Privada</SelectItem>
          </SelectContent>
        </Select>
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
