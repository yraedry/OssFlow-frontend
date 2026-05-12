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
    <div className="space-y-5">

      {/* Header */}
      <div className="border border-border bg-card px-5 py-4">
        <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>Planificación</div>
        <h1 className="font-black leading-none" style={{ ...SERIF, fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.02em' }}>
          Plantilla semanal
        </h1>
        <p className="mt-2 text-xs text-muted-foreground" style={MONO}>
          Marca qué tipo de sesión toca cada día · editable en cualquier momento
        </p>
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
