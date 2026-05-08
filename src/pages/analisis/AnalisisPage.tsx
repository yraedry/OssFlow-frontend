import { useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useBjjRadar, useFisicoRadar } from '@/features/analisis/radar/hooks'

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

const RADAR_CHART_STYLE = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'hsl(var(--foreground))',
  },
}

function RadarCard({
  title,
  subtitle,
  color,
  data,
  isLoading,
  error,
  emptyHint,
}: {
  title: string
  subtitle: string
  color: string
  data: { family: string; label: string; value: number }[] | undefined
  isLoading: boolean
  error: unknown
  emptyHint: string
}) {
  const totalReps = data?.reduce((s, d) => s + d.value, 0) ?? 0
  const hasData = totalReps > 0

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4" style={{ borderLeft: `4px solid ${color}` }}>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {hasData
            ? `${totalReps} ${subtitle} registradas en el período`
            : `Sin datos en el período`}
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
          <p className="text-sm">{emptyHint}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis
              dataKey="label"
              tick={{
                fill: '#e2e8f0',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'auto']}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              name="Total"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.45}
              strokeWidth={3}
              dot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 1.5 }}
            />
            <Tooltip
              contentStyle={RADAR_CHART_STYLE.contentStyle}
              formatter={(value) => [`${value}`, 'Sesiones/Reps']}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {hasData && data && (
        <div className="grid grid-cols-2 gap-1 pt-2 border-t border-border">
          {data
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value)
            .map(d => (
              <div key={d.family} className="flex items-center justify-between px-2 py-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {d.label}
                </span>
                <span className="text-xs font-semibold tabular-nums">{d.value}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function BjjRadarCard({ days }: { days: number }) {
  const { data, isLoading, error } = useBjjRadar(days)
  return (
    <RadarCard
      title="Radar BJJ"
      subtitle="repeticiones"
      color="#f97316"
      data={data}
      isLoading={isLoading}
      error={error}
      emptyHint="Registra sesiones BJJ con técnicas trabajadas para ver tu radar de familias aquí"
    />
  )
}

function FisicoRadarCard({ days }: { days: number }) {
  const { data, isLoading, error } = useFisicoRadar(days)
  return (
    <RadarCard
      title="Radar Físico"
      subtitle="sesiones"
      color="#06b6d4"
      data={data}
      isLoading={isLoading}
      error={error}
      emptyHint="Registra sesiones físicas (fuerza, cardio, flexibilidad...) para ver tu radar aquí"
    />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BjjRadarCard days={days} />
        <FisicoRadarCard days={days} />
      </div>
    </div>
  )
}
