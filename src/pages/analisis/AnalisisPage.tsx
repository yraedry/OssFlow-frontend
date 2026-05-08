import { useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useBjjRadar, useFisicoRadar } from '@/features/analisis/radar/hooks'
import type { RadarDataPoint } from '@/features/analisis/radar/types'

// ─── Familias por sub-radar ───────────────────────────────────────────────────

const GUARDIAS_FAMILIES = ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'DLR_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT']
const SUMISIONES_FAMILIES = ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS']
const MOVIMIENTO_FAMILIES = ['GUARD_PASSES', 'TAKEDOWNS', 'SWEEPS', 'BACK_TAKES', 'ESCAPES']

// ─── Period selector ──────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: '6 meses', days: 180 },
  { label: '1 año',   days: 365 },
  { label: 'Todo',    days: 3650 },
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

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? 'text-foreground'
          : 'text-muted-foreground border-transparent hover:text-foreground'
      }`}
      style={active ? { borderBottomColor: color, color } : {}}
    >
      {children}
    </button>
  )
}

// ─── Radar card ───────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
  color: 'hsl(var(--foreground))',
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
  data: RadarDataPoint[] | undefined
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
          {hasData ? `${totalReps} ${subtitle} en el período` : 'Sin datos en el período'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar datos</AlertDescription></Alert>
      ) : !hasData ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <p className="text-sm text-center">{emptyHint}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: '#e2e8f0', fontSize: 11, fontFamily: 'var(--font-mono)' }}
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
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}`, 'reps']} />
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

// ─── BJJ tabs ─────────────────────────────────────────────────────────────────

type BjjTab = 'guardias' | 'sumisiones' | 'movimiento'

const BJJ_TABS: { id: BjjTab; label: string; families: string[]; color: string; title: string; subtitle: string; hint: string }[] = [
  {
    id: 'guardias',
    label: 'Guardias',
    families: GUARDIAS_FAMILIES,
    color: '#f97316',
    title: 'Radar · Guardias',
    subtitle: 'reps',
    hint: 'Registra técnicas desde guardia cerrada, media guardia, De La Riva, mariposa o entrelazados',
  },
  {
    id: 'sumisiones',
    label: 'Sumisiones',
    families: SUMISIONES_FAMILIES,
    color: '#e11d48',
    title: 'Radar · Sumisiones',
    subtitle: 'reps',
    hint: 'Registra estrangulaciones, guillotinas, triángulos, armbars, kimuras y leg locks',
  },
  {
    id: 'movimiento',
    label: 'Movimiento',
    families: MOVIMIENTO_FAMILIES,
    color: '#a855f7',
    title: 'Radar · Movimiento',
    subtitle: 'reps',
    hint: 'Registra pasajes, derribos, barridas, tomas de espalda y escapadas',
  },
]

function BjjTabs({ days }: { days: number }) {
  const [activeTab, setActiveTab] = useState<BjjTab>('guardias')
  const { data: allData, isLoading, error } = useBjjRadar(days)

  const current = BJJ_TABS.find(t => t.id === activeTab)!
  const filteredData = allData?.filter(d => current.families.includes(d.family))

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden" style={{ borderLeft: `4px solid ${current.color}` }}>
      {/* Tab bar */}
      <div className="flex border-b border-border px-4 pt-4 gap-1">
        {BJJ_TABS.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            color={tab.color}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <RadarCard
          title={current.title}
          subtitle={current.subtitle}
          color={current.color}
          data={filteredData}
          isLoading={isLoading}
          error={error}
          emptyHint={current.hint}
        />
      </div>
    </div>
  )
}

// ─── Físico card ──────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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
        <BjjTabs days={days} />
        <FisicoRadarCard days={days} />
      </div>
    </div>
  )
}
