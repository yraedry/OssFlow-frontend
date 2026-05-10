import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  { key: 'bjj' as const, label: 'BJJ', color: '#4a7cff' },
  { key: 'strength' as const, label: 'Fuerza', color: '#f59e0b' },
  { key: 'cardio' as const, label: 'Cardio', color: '#10b981' },
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
        <div className="grid grid-cols-4 border-b border-border bg-muted/30">
          <div className="py-2.5 px-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
            Día
          </div>
          {COLS.map((col) => (
            <div key={col.key} className="py-2.5 px-3 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: col.color, fontWeight: 700 }}>
              {col.label}
            </div>
          ))}
        </div>
        {/* Rows */}
        {ALL_DAYS.map((day, idx) => (
          <div key={day} className="grid grid-cols-4 border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors">
            <div className="py-3.5 px-4 flex items-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
              {DAY_LABELS[day]}
            </div>
            {COLS.map((col) => (
              <div key={col.key} className="py-3.5 px-3 flex items-center justify-center">
                <Controller
                  control={control}
                  name={`days.${idx}.${col.key}`}
                  render={({ field }) => {
                    const checked = field.value as boolean
                    return (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => field.onChange(!checked)}
                        className="w-9 h-5 relative flex items-center border transition-colors focus:outline-none"
                        style={{
                          backgroundColor: checked ? col.color : 'transparent',
                          borderColor: checked ? col.color : 'var(--color-border)',
                        }}
                      >
                        <span
                          className="absolute h-3 w-3 transition-transform"
                          style={{
                            backgroundColor: checked ? '#fff' : 'var(--color-muted-foreground)',
                            transform: checked ? 'translateX(20px)' : 'translateX(4px)',
                          }}
                        />
                      </button>
                    )
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 border border-border text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </button>
    </form>
  )
}
