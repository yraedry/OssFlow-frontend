import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { createRulesetSchema, type CreateRulesetForm } from '../schemas'
import type { Ruleset } from '../types'
import { useFederations } from '@/features/identity/federation/hooks'

type RulesetFormProps = {
  defaultValues?: Partial<Ruleset>
  onSubmit: (data: CreateRulesetForm) => void
  isPending?: boolean
}

export function RulesetForm({ defaultValues, onSubmit, isPending }: RulesetFormProps) {
  const { data: federations = [] } = useFederations()

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateRulesetForm>({
    resolver: zodResolver(createRulesetSchema),
    defaultValues: {
      federationId: defaultValues?.federationId ?? undefined,
      sourceUrl: defaultValues?.sourceUrl ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Federación *</Label>
        <Controller
          control={control}
          name="federationId"
          render={({ field }) => (
            <Select
              value={field.value?.toString()}
              onValueChange={(v) => field.onChange(parseInt(v))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar federación" /></SelectTrigger>
              <SelectContent>
                {federations.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>{f.name} ({f.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.federationId && <p className="text-sm text-destructive">{errors.federationId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">URL del reglamento (opcional)</Label>
        <Input id="sourceUrl" {...register('sourceUrl')} placeholder="https://ibjjf.com/reglamento..." />
        {errors.sourceUrl && <p className="text-sm text-destructive">{errors.sourceUrl.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Crear reglamento'}
      </Button>
    </form>
  )
}
