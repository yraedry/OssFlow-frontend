import { WeeklyCalendar } from '../components/WeeklyCalendar'

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const MONO_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--color-muted-foreground)',
}

export function WeeklySchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={SERIF}>
          Calendario semanal
        </h1>
        <p className="mt-1" style={MONO_LABEL}>
          Planifica visualmente tus sesiones por hora.
        </p>
      </div>

      <WeeklyCalendar />
    </div>
  )
}
