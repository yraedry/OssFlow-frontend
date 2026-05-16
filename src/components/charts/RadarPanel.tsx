import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import type { RadarDataPoint } from '@/features/analisis/radar/types'
import { TOOLTIP_STYLE, type Section } from './types'

export type { Section, SectionId, DataSource } from './types'

type RadiusDomain = [number | string, number | string]

interface RadarPanelProps {
  section: Section
  data: RadarDataPoint[] | undefined
  isLoading: boolean
  error: unknown
  /** Override del domain del eje radial. Por defecto [0, 'auto']. */
  radiusDomain?: RadiusDomain
}

export function RadarPanel({
  section, data, isLoading, error, radiusDomain,
}: RadarPanelProps) {
  const points = data?.filter(d => section.families.includes(d.family)) ?? []
  const hasData = points.some(d => d.value !== 0)

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (error) return <Alert variant="destructive"><AlertDescription>Error al cargar datos</AlertDescription></Alert>
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="text-sm text-muted-foreground max-w-[260px]">{section.emptyHint}</p>
      </div>
    )
  }

  const sorted = [...points].filter(d => d.value !== 0).sort((a, b) => b.value - a.value)
  const domain: RadiusDomain = radiusDomain ?? [0, 'auto']

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={points} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
          <PolarRadiusAxis angle={90} domain={domain} tick={false} tickCount={4} axisLine={false} />
          <Radar
            name="Total"
            dataKey="value"
            stroke={section.color}
            fill={section.color}
            fillOpacity={0.35}
            strokeWidth={2}
            dot={{ r: 4, fill: section.color, stroke: '#0f172a', strokeWidth: 1.5 }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v} ${section.subtitle}`, '']}
            labelFormatter={(label) => label}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-3 border-t border-border">
        {sorted.map(d => (
          <div key={d.family} className="flex items-center justify-between py-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono min-w-0">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: section.color }} />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="text-xs font-bold tabular-nums ml-2 flex-shrink-0" style={{ color: section.color }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
