import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createSystemSchema, type CreateSystemForm } from '../schemas'
import type { System } from '../types'

type SystemFormProps = {
  defaultValues?: Partial<System>
  onSubmit: (data: CreateSystemForm) => void
  isPending?: boolean
}

export function SystemForm({ defaultValues, onSubmit, isPending }: SystemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSystemForm>({
    resolver: zodResolver(createSystemSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      flowDefinition: defaultValues?.flowDefinition ?? '{"nodes":[],"edges":[]}',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} placeholder="Mi sistema BJJ" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción del sistema..."
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="flowDefinition">Definición de flujo (JSON)</Label>
        <Textarea
          id="flowDefinition"
          {...register('flowDefinition')}
          placeholder='{"nodes":[],"edges":[]}'
          rows={3}
        />
        {errors.flowDefinition && (
          <p className="text-sm text-destructive">{errors.flowDefinition.message}</p>
        )}
      </div>

      <button type="submit" disabled={isPending} className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear sistema'}
      </button>
    </form>
  )
}
