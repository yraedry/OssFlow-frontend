import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { createExerciseSchema, type CreateExerciseForm } from '../schemas'
import type { Exercise } from '../types'
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '../types'

interface ExerciseFormProps {
  defaultValues?: Partial<Exercise>
  onSubmit: (data: CreateExerciseForm) => void
  isPending?: boolean
}

export function ExerciseForm({ defaultValues, onSubmit, isPending }: ExerciseFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateExerciseForm>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category ?? 'STRENGTH',
      equipment: defaultValues?.equipment ?? 'NO_EQUIPMENT',
      youtubeUrl: defaultValues?.youtubeUrl ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register('name')} placeholder="Sentadilla búlgara" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent position="popper">
                  {(Object.entries(CATEGORY_LABELS) as [keyof typeof CATEGORY_LABELS, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Equipamiento *</Label>
          <Controller
            control={control}
            name="equipment"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Seleccionar equipamiento" /></SelectTrigger>
                <SelectContent position="popper">
                  {(Object.entries(EQUIPMENT_LABELS) as [keyof typeof EQUIPMENT_LABELS, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.equipment && <p className="text-sm text-destructive">{errors.equipment.message}</p>}
        </div>
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
        <Textarea id="description" {...register('description')} rows={3} />
      </div>

      <button type="submit" disabled={isPending} className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear ejercicio'}
      </button>
    </form>
  )
}
