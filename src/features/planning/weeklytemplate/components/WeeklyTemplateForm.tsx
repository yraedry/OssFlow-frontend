import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { saveWeeklyTemplateSchema, type SaveWeeklyTemplateForm } from '../schemas'
import { ALL_DAYS, DAY_LABELS } from '../types'
import type { WeeklyTemplate } from '../types'

type Props = {
  template: WeeklyTemplate
  onSave: (data: SaveWeeklyTemplateForm) => void
  isPending: boolean
}

function buildDefaultDays() {
  return ALL_DAYS.map((day) => ({
    dayOfWeek: day,
    bjj: false,
    strength: false,
    cardio: false,
  }))
}

function templateToForm(template: WeeklyTemplate): SaveWeeklyTemplateForm {
  const map = new Map(template.days.map((d) => [d.dayOfWeek, d]))
  return {
    days: ALL_DAYS.map((day) => map.get(day) ?? { dayOfWeek: day, bjj: false, strength: false, cardio: false }),
  }
}

const COLS = [
  { key: 'bjj' as const, label: 'BJJ' },
  { key: 'strength' as const, label: 'Fuerza' },
  { key: 'cardio' as const, label: 'Cardio' },
]

export function WeeklyTemplateForm({ template, onSave, isPending }: Props) {
  const { control, handleSubmit } = useForm<SaveWeeklyTemplateForm>({
    resolver: zodResolver(saveWeeklyTemplateSchema),
    defaultValues: template.days.length > 0 ? templateToForm(template) : { days: buildDefaultDays() },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="border border-border">
        {/* Header */}
        <div className="grid grid-cols-4 border-b border-border bg-card">
          <div className="py-2 px-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
            Día
          </div>
          {COLS.map((col) => (
            <div key={col.key} className="py-2 px-3 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
              {col.label}
            </div>
          ))}
        </div>
        {/* Rows */}
        {ALL_DAYS.map((day, idx) => (
          <div key={day} className="grid grid-cols-4 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
            <div className="py-3 px-3 flex items-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {DAY_LABELS[day]}
            </div>
            {COLS.map((col) => (
              <div key={col.key} className="py-3 px-3 flex items-center justify-center">
                <Controller
                  control={control}
                  name={`days.${idx}.${col.key}`}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value as boolean}
                      onChange={field.onChange}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--color-foreground)' }}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </Button>
    </form>
  )
}
