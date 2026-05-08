import { useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useBjjRadar } from '@/features/analisis/radar/hooks'

const PERIOD_OPTIONS = [
  { label: '30 días',  days: 30 },
  { label: '90 días',  days: 90 },
  { label: '6 meses',  days: 180 },
  { label: '1 año',    days: 365 },
  { label: 'Todo',     days: 3650 },
]

function PeriodButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function BjjRadarCard({ days }: { days: number }) {
  const { data, isLoading, error } = useBjjRadar(days)

  const totalReps = data?.reduce((s, d) => s + d.value, 0) ?? 0
  const hasData = totalReps > 0

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Radar BJJ</h2>
        <p className="text-sm text-muted-foreground">
          {hasData
            ? `${totalReps} repeticiones registradas en el período`
            : 'Sin sesiones registradas en el período'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar datos del radar</AlertDescription>
        </Alert>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
          <p className="text-sm">Registra sesiones BJJ con técnicas trabajadas</p>
          <p className="text-xs">para ver tu radar de familias aquí</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'auto']}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              name="Repeticiones"
              dataKey="value"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ r: 4, fill: 'hsl(var(--destructive))', strokeWidth: 0 }}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [`${value} reps`, 'Entrenadas']}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {/* Tabla de valores */}
      {hasData && data && (
        <div className="grid grid-cols-2 gap-1 pt-2 border-t border-border">
          {data
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value)
            .map(d => (
              <div key={d.family} className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-muted-foreground font-mono">{d.label}</span>
                <span className="text-xs font-semibold tabular-nums">{d.value}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function AnalisisPage() {
  const [days, setDays] = useState(90)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Análisis</h1>
          <p className="text-muted-foreground text-sm">Tu evolución como peleador</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PERIOD_OPTIONS.map(o => (
            <PeriodButton key={o.days} active={days === o.days} onClick={() => setDays(o.days)}>
              {o.label}
            </PeriodButton>
          ))}
        </div>
      </div>

      <BjjRadarCard days={days} />

      {/* Radar físico — próximamente */}
      <div className="rounded-lg border border-border border-dashed p-6 text-center text-muted-foreground space-y-1">
        <p className="text-sm font-medium">Radar Físico</p>
        <p className="text-xs">Fuerza · Cardio · Velocidad · Flexibilidad · Explosividad · Movilidad</p>
        <p className="text-xs opacity-60">Próximamente — se alimentará de tus sesiones físicas</p>
      </div>
    </div>
  )
}
