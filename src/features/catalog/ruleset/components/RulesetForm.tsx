import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createRulesetSchema, type CreateRulesetForm } from '../schemas'
import type { Ruleset } from '../types'

type RulesetFormProps = {
  defaultValues?: Partial<Ruleset>
  onSubmit: (data: CreateRulesetForm) => void
  isPending?: boolean
}

export function RulesetForm({ defaultValues, onSubmit, isPending }: RulesetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRulesetForm>({
    resolver: zodResolver(createRulesetSchema),
    defaultValues: {
      federationId: defaultValues?.federationId ?? undefined,
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      version: defaultValues?.version ?? '',
      effectiveDate: defaultValues?.effectiveDate ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="federationId">ID de Federación</Label>
        <Input
          id="federationId"
          type="number"
          min={1}
          {...register('federationId', { valueAsNumber: true })}
          placeholder="1"
        />
        {errors.federationId && (
          <p className="text-sm text-destructive">{errors.federationId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} placeholder="Reglamento IJF 2024" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Versión</Label>
        <Input id="version" {...register('version')} placeholder="2024.1" />
        {errors.version && <p className="text-sm text-destructive">{errors.version.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectiveDate">Fecha de vigencia</Label>
        <Input id="effectiveDate" type="date" {...register('effectiveDate')} />
        {errors.effectiveDate && (
          <p className="text-sm text-destructive">{errors.effectiveDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción del reglamento..."
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear reglamento'}
      </Button>
    </form>
  )
}
