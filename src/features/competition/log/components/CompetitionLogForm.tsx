import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { createCompetitionLogSchema, type CreateCompetitionLogForm } from '../schemas'
import { CATEGORY_AGE_OPTIONS, GI_NOGI_OPTIONS, type CompetitionLog } from '../types'

type CompetitionLogFormProps = {
  defaultValues?: Partial<CompetitionLog>
  onSubmit: (data: CreateCompetitionLogForm) => void
  isPending?: boolean
}

export function CompetitionLogForm({ defaultValues, onSubmit, isPending }: CompetitionLogFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateCompetitionLogForm>({
    resolver: zodResolver(createCompetitionLogSchema),
    defaultValues: {
      eventName:        defaultValues?.eventName        ?? '',
      eventDate:        defaultValues?.eventDate        ?? '',
      weightCategory:   defaultValues?.weightCategory   ?? '',
      categoryAge:      defaultValues?.categoryAge      ?? '',
      location:         defaultValues?.location         ?? '',
      giNogi:           defaultValues?.giNogi           ?? '',
      totalMatches:     defaultValues?.totalMatches     ?? undefined,
      result:           defaultValues?.result           ?? '',
      analysisMarkdown: defaultValues?.analysisMarkdown ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nombre del evento */}
      <div className="space-y-1.5">
        <Label htmlFor="eventName">
          Nombre del evento <span className="text-destructive">*</span>
        </Label>
        <Input
          id="eventName"
          {...register('eventName')}
          placeholder="Copa BJJ Madrid 2026"
          autoFocus
        />
        {errors.eventName && <p className="text-xs text-destructive">{errors.eventName.message}</p>}
      </div>

      {/* Fecha y ubicación */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Fecha <span className="text-destructive">*</span></Label>
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} placeholder="Seleccionar fecha" />
            )}
          />
          {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" {...register('location')} placeholder="Madrid, España" />
        </div>
      </div>

      {/* Modalidad, categoría edad, peso */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="giNogi">Modalidad</Label>
          <select
            id="giNogi"
            {...register('giNogi')}
            className="flex h-9 w-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">—</option>
            {GI_NOGI_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoryAge">Categoría edad</Label>
          <select
            id="categoryAge"
            {...register('categoryAge')}
            className="flex h-9 w-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">—</option>
            {CATEGORY_AGE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightCategory">Peso</Label>
          <Input id="weightCategory" {...register('weightCategory')} placeholder="-76 kg" />
        </div>
      </div>

      {/* Resultado y combates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="result">Resultado final</Label>
          <Input id="result" {...register('result')} placeholder="1er puesto" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="totalMatches">Combates totales</Label>
          <Input
            id="totalMatches"
            type="number"
            min={0}
            {...register('totalMatches', { valueAsNumber: true })}
            placeholder="5"
          />
        </div>
      </div>

      {/* Análisis */}
      <div className="space-y-1.5">
        <Label htmlFor="analysisMarkdown">Análisis</Label>
        <Textarea
          id="analysisMarkdown"
          {...register('analysisMarkdown')}
          placeholder="Reflexiones sobre la competencia, qué funcionó, qué mejorar..."
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
      >
        {isPending ? 'Guardando...' : defaultValues?.id ? 'Actualizar' : 'Registrar competencia'}
      </button>
    </form>
  )
}
