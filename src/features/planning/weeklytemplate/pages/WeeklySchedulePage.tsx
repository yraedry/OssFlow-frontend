import { WeeklyCalendar } from '../components/WeeklyCalendar'

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}

export function WeeklySchedulePage() {
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="border border-border bg-card px-5 py-4">
        <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>Planificación</div>
        <h1 className="font-black leading-none" style={{ ...SERIF, fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.02em' }}>
          Calendario semanal
        </h1>
        <p className="mt-2 text-xs text-muted-foreground" style={MONO}>
          Planifica visualmente tus sesiones por hora. Haz clic en cualquier celda para asignarle un tipo de sesión.
        </p>
      </div>

      <WeeklyCalendar />
    </div>
  )
}
