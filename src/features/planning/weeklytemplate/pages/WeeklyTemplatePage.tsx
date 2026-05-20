import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useWeeklyTemplate, useSaveWeeklyTemplate } from '../hooks'
import { WeeklyTemplateForm } from '../components/WeeklyTemplateForm'
import type { SaveWeeklyTemplateForm } from '../schemas'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

export function WeeklyTemplatePage() {
  const { data: template, isLoading, error } = useWeeklyTemplate()
  const saveMutation = useSaveWeeklyTemplate()

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="border border-border bg-card px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Planificación
        </p>
        <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
          Plantilla semanal
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground font-mono">
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
