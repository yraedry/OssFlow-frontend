import { useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useBjjRadar, useFisicoRadar } from '@/features/analisis/radar/hooks'
import type { RadarDataPoint } from '@/features/analisis/radar/types'

// ─── Períodos ─────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: '30d',   days: 30 },
  { label: '90d',   days: 90 },
  { label: '6m',    days: 180 },
  { label: '1a',    days: 365 },
  { label: 'Todo',  days: 3650 },
]

// ─── Definición de secciones ──────────────────────────────────────────────────

type SectionId = 'guardias' | 'sumisiones' | 'pasajes' | 'derribos' | 'fisico'
type DataSource = 'bjj' | 'fisico'

interface Section {
  id: SectionId
  label: string
  color: string
  source: DataSource
  families: string[]
  title: string
  subtitle: string
  emptyHint: string
}

const SECTIONS: Section[] = [
  {
    id: 'guardias',
    label: 'Guardias',
    color: '#f97316',
    source: 'bjj',
    families: ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'DLR_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT'],
    title: 'Guardias',
    subtitle: 'reps',
    emptyHint: 'Registra técnicas desde guardia cerrada, media guardia, De La Riva, mariposa o entrelazados',
  },
  {
    id: 'sumisiones',
    label: 'Sumisiones',
    color: '#e11d48',
    source: 'bjj',
    families: ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS'],
    title: 'Sumisiones',
    subtitle: 'reps',
    emptyHint: 'Registra estrangulaciones, guillotinas, triángulos, armbars, kimuras y leg locks',
  },
  {
    id: 'pasajes',
    label: 'Pasajes',
    color: '#0ea5e9',
    source: 'bjj',
    families: ['GUARD_PASSES'],
    title: 'Pasajes de Guardia',
    subtitle: 'reps',
    emptyHint: 'Registra pasajes: toreando, knee slice, over-under, leg drag...',
  },
  {
    id: 'derribos',
    label: 'Derribos',
    color: '#a855f7',
    source: 'bjj',
    families: ['TAKEDOWNS', 'SWEEPS', 'BACK_TAKES', 'ESCAPES'],
    title: 'Derribos y Movimiento',
    subtitle: 'reps',
    emptyHint: 'Registra derribos, barridas, tomas de espalda y escapadas',
  },
  {
    id: 'fisico',
    label: 'Físico',
    color: '#06b6d4',
    source: 'fisico',
    families: ['STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'MOBILITY', 'OTHER'],
    title: 'Cualidades físicas',
    subtitle: 'sesiones',
    emptyHint: 'Registra sesiones físicas (fuerza, cardio, movilidad, flexibilidad...) para ver tu radar',
  },
]

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  fontSize: '11px',
  fontFamily: 'var(--font-mono)',
  color: '#e2e8f0',
  padding: '6px 10px',
}

// ─── Radar panel ─────────────────────────────────────────────────────────────

function RadarPanel({
  section,
  data,
  isLoading,
  error,
}: {
  section: Section
  data: RadarDataPoint[] | undefined
  isLoading: boolean
  error: unknown
}) {
  const points = data?.filter(d => section.families.includes(d.family)) ?? []
  const total = points.reduce((s, d) => s + d.value, 0)
  const hasData = total > 0

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner /></div>
  }
  if (error) {
    return <Alert variant="destructive"><AlertDescription>Error al cargar datos</AlertDescription></Alert>
  }
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="text-sm text-muted-foreground max-w-[260px]">{section.emptyHint}</p>
      </div>
    )
  }

  const sorted = [...points].filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={points} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#cbd5e1', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 'auto']}
            tick={false}
            tickCount={4}
            axisLine={false}
          />
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

      {/* Leyenda compacta */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AnalisisPage() {
  const [days, setDays] = useState(90)
  const [active, setActive] = useState<SectionId>('guardias')

  const { data: bjjData, isLoading: bjjLoading, error: bjjError } = useBjjRadar(days)
  const { data: fisicoData, isLoading: fisicoLoading, error: fisicoError } = useFisicoRadar(days)

  const section = SECTIONS.find(s => s.id === active)!
  const data    = section.source === 'bjj' ? bjjData : fisicoData
  const loading = section.source === 'bjj' ? bjjLoading : fisicoLoading
  const error   = section.source === 'bjj' ? bjjError : fisicoError
  const total   = (data?.filter(d => section.families.includes(d.family)) ?? []).reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold">Análisis</h1>
        <p className="text-muted-foreground text-sm">Tu evolución como peleador</p>
      </div>

      {/* Período */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {PERIOD_OPTIONS.map(o => (
          <button
            key={o.days}
            onClick={() => setDays(o.days)}
            className={`px-3 py-1.5 text-xs font-mono rounded border flex-shrink-0 transition-colors ${
              days === o.days
                ? 'bg-foreground text-background border-foreground'
                : 'text-muted-foreground border-border hover:border-foreground hover:text-foreground'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Panel único */}
      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ borderTop: `3px solid ${section.color}` }}>

        {/* Selector de sección */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-mono uppercase tracking-wide transition-colors border-b-2 ${
                  active === s.id
                    ? 'font-semibold border-current'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
                style={active === s.id ? { color: s.color, borderBottomColor: s.color } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-base font-semibold">{section.title}</p>
            {total > 0 && (
              <p className="text-xs text-muted-foreground font-mono">{total} {section.subtitle}</p>
            )}
          </div>
          {total > 0 && (
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: section.color }}
            >
              {total}
            </span>
          )}
        </div>

        {/* Radar */}
        <div className="px-4 pb-4">
          <RadarPanel section={section} data={data} isLoading={loading} error={error} />
        </div>

      </div>
    </div>
  )
}
