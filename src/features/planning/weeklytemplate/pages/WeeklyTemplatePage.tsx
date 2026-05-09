import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useWeeklyTemplate, useSaveWeeklyTemplate } from '../hooks'
import { WeeklyTemplateForm } from '../components/WeeklyTemplateForm'
import type { SaveWeeklyTemplateForm } from '../schemas'

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

export function WeeklyTemplatePage() {
  const { data: template, isLoading, error } = useWeeklyTemplate()
  const saveMutation = useSaveWeeklyTemplate()

  return (
    <div className="space-y-5 max-w-xl">

      {/* Header */}
      <div className="border border-border bg-card px-5 py-4">
        <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>Planificación</div>
        <h1 className="font-black leading-none" style={{ ...SERIF, fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.02em' }}>
          Plantilla semanal
        </h1>
        <p className="mt-2 text-xs text-muted-foreground" style={MONO}>
          Marca qué tipo de sesión toca cada día. Esto aparece en el inicio como tu plan del día.
        </p>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'BJJ', color: '#4a7cff' },
          { label: 'Fuerza', color: '#f59e0b' },
          { label: 'Cardio', color: '#10b981' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>{label}</span>
          </div>
        ))}
        <span style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginLeft: 'auto' }}>
          Sin marca = día de descanso
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar la plantilla</AlertDescription></Alert>
      ) : template ? (
        <WeeklyTemplateForm
          template={template}
          onSave={(data: SaveWeeklyTemplateForm) => saveMutation.mutate(data)}
          isPending={saveMutation.isPending}
        />
      ) : null}

      {saveMutation.isSuccess && (
        <p className="text-xs text-center" style={{ ...MONO, color: '#10b981' }}>
          ✓ Plantilla guardada correctamente
        </p>
      )}
    </div>
  )
}
