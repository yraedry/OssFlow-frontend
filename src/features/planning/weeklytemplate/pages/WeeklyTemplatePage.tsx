import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useWeeklyTemplate, useSaveWeeklyTemplate } from '../hooks'
import { WeeklyTemplateForm } from '../components/WeeklyTemplateForm'
import type { SaveWeeklyTemplateForm } from '../schemas'

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const MONO_LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }

export function WeeklyTemplatePage() {
  const { data: template, isLoading, error } = useWeeklyTemplate()
  const saveMutation = useSaveWeeklyTemplate()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={SERIF}>
          Plantilla semanal
        </h1>
        <p className="mt-1" style={MONO_LABEL}>
          Define qué tipo de sesión toca cada día.
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
    </div>
  )
}
