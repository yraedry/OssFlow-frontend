import { useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useBjjRadar, useFisicoRadar } from '@/features/analisis/radar/hooks'
import type { RadarDataPoint } from '@/features/analisis/radar/types'

// ─── Period selector ──────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
  { label: '6 meses', days: 180 },
  { label: '1 año',   days: 365 },
  { label: 'Todo',    days: 3650 },
]

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = 'guardias' | 'sumisiones' | 'pasajes' | 'derribos' | 'fuerza' | 'movilidad' | 'flexibilidad'
type DataSource = 'bjj' | 'fisico'

interface TabDef {
  id: TabId
  label: string
  icon: string
  color: string
  source: DataSource
  families: string[]
  title: string
  subtitle: string
  emptyHint: string
  group: 'bjj' | 'fisico'
}

const TABS: TabDef[] = [
  {
    id: 'guardias',
    label: 'Guardias',
    icon: '🛡',
    color: '#f97316',
    source: 'bjj',
    families: ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'DLR_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT'],
    title: 'Guardias',
    subtitle: 'reps',
    emptyHint: 'Registra técnicas desde guardia cerrada, media guardia, De La Riva, mariposa o entrelazados',
    group: 'bjj',
  },
  {
    id: 'sumisiones',
    label: 'Sumisiones',
    icon: '✊',
    color: '#e11d48',
    source: 'bjj',
    families: ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS'],
    title: 'Sumisiones',
    subtitle: 'reps',
    emptyHint: 'Registra estrangulaciones, guillotinas, triángulos, armbars, kimuras y leg locks',
    group: 'bjj',
  },
  {
    id: 'pasajes',
    label: 'Pasajes',
    icon: '⚡',
    color: '#0ea5e9',
    source: 'bjj',
    families: ['GUARD_PASSES'],
    title: 'Pasajes de Guardia',
    subtitle: 'reps',
    emptyHint: 'Registra pasajes: toreando, knee slice, over-under, leg drag, body lock...',
    group: 'bjj',
  },
  {
    id: 'derribos',
    label: 'Derribos',
    icon: '↓',
    color: '#eab308',
    source: 'bjj',
    families: ['TAKEDOWNS', 'SWEEPS', 'BACK_TAKES', 'ESCAPES'],
    title: 'Derribos y Movimiento',
    subtitle: 'reps',
    emptyHint: 'Registra derribos, barridas, tomas de espalda y escapadas',
    group: 'bjj',
  },
  {
    id: 'fuerza',
    label: 'Fuerza',
    icon: '💪',
    color: '#06b6d4',
    source: 'fisico',
    families: ['STRENGTH', 'CARDIO', 'HIIT', 'OTHER'],
    title: 'Acondicionamiento Físico',
    subtitle: 'sesiones',
    emptyHint: 'Registra sesiones de fuerza, cardio o HIIT para ver tu radar aquí',
    group: 'fisico',
  },
  {
    id: 'movilidad',
    label: 'Movilidad',
    icon: '🌀',
    color: '#10b981',
    source: 'fisico',
    families: ['MOBILITY'],
    title: 'Movilidad',
    subtitle: 'sesiones',
    emptyHint: 'Registra sesiones de movilidad para ver tu radar aquí',
    group: 'fisico',
  },
  {
    id: 'flexibilidad',
    label: 'Flexibilidad',
    icon: '🤸',
    color: '#d946ef',
    source: 'fisico',
    families: ['FLEXIBILITY'],
    title: 'Flexibilidad',
    subtitle: 'sesiones',
    emptyHint: 'Registra sesiones de flexibilidad para ver tu radar aquí',
    group: 'fisico',
  },
]

const BJJ_TABS  = TABS.filter(t => t.group === 'bjj')
const FISICO_TABS = TABS.filter(t => t.group === 'fisico')

// ─── Shared tooltip style ─────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
  color: '#e2e8f0',
}

// ─── Period button ────────────────────────────────────────────────────────────

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

function TabButton({ active, tab, onClick }: { active: boolean; tab: TabDef; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 ${
        active
          ? 'text-background font-semibold shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      style={active ? { backgroundColor: tab.color } : {}}
    >
      <span className="hidden sm:inline">{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  )
}

// ─── Radar display ────────────────────────────────────────────────────────────

function RadarDisplay({
  tab,
  data,
  isLoading,
  error,
}: {
  tab: TabDef
  data: RadarDataPoint[] | undefined
  isLoading: boolean
  error: unknown
}) {
  const filtered = data?.filter(d => tab.families.includes(d.family)) ?? []
  const total = filtered.reduce((s, d) => s + d.value, 0)
  const hasData = total > 0

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spinner /></div>
  }
  if (error) {
    return <Alert variant="destructive"><AlertDescription>Error al cargar datos</AlertDescription></Alert>
  }
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl opacity-40">{tab.icon}</span>
        <p className="text-sm text-muted-foreground text-center max-w-xs">{tab.emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={filtered} margin={{ top: 10, right: 28, bottom: 10, left: 28 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#e2e8f0', fontSize: 10, fontFamily: 'var(--font-mono)' }}
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
            stroke={tab.color}
            fill={tab.color}
            fillOpacity={0.4}
            strokeWidth={2.5}
            dot={{ r: 5, fill: tab.color, stroke: '#0f172a', strokeWidth: 1.5 }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v} ${tab.subtitle}`, '']}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1 pt-3 border-t border-border">
        {filtered
          .filter(d => d.value > 0)
          .sort((a, b) => b.value - a.value)
          .map(d => (
            <div key={d.family} className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted transition-colors">
              <span className="flex items-center gap-2 text-xs text-muted-foreground font-mono truncate">
                <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: tab.color }} />
                {d.label}
              </span>
              <span className="text-xs font-bold tabular-nums ml-2" style={{ color: tab.color }}>{d.value}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ─── Tab group ────────────────────────────────────────────────────────────────

function TabGroup({
  label,
  tabs,
  activeId,
  onSelect,
  bjjData,
  bjjLoading,
  bjjError,
  fisicoData,
  fisicoLoading,
  fisicoError,
}: {
  label: string
  tabs: TabDef[]
  activeId: TabId
  onSelect: (id: TabId) => void
  bjjData: RadarDataPoint[] | undefined
  bjjLoading: boolean
  bjjError: unknown
  fisicoData: RadarDataPoint[] | undefined
  fisicoLoading: boolean
  fisicoError: unknown
}) {
  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0]
  const isActive = tabs.some(t => t.id === activeId)

  if (!isActive) return null

  const data    = activeTab.source === 'bjj' ? bjjData : fisicoData
  const loading = activeTab.source === 'bjj' ? bjjLoading : fisicoLoading
  const error   = activeTab.source === 'bjj' ? bjjError : fisicoError

  const total = (data?.filter(d => activeTab.families.includes(d.family)) ?? []).reduce((s, d) => s + d.value, 0)

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ borderTop: `3px solid ${activeTab.color}` }}
    >
      {/* Header */}
      <div className="pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3 px-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
            <h2 className="text-base font-semibold">{activeTab.title}</h2>
          </div>
          {total > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums" style={{ color: activeTab.color }}>{total}</p>
              <p className="text-xs text-muted-foreground">{activeTab.subtitle}</p>
            </div>
          )}
        </div>
        {/* Tab buttons — scroll horizontal en móvil */}
        <div className="flex gap-1 overflow-x-auto px-4 pb-0.5 scrollbar-none">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeId === tab.id}
              onClick={() => onSelect(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <RadarDisplay tab={activeTab} data={data} isLoading={loading} error={error} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AnalisisPage() {
  const [days, setDays] = useState(90)
  const [activeBjj, setActiveBjj]     = useState<TabId>('guardias')
  const [activeFisico, setActiveFisico] = useState<TabId>('fuerza')

  const { data: bjjData, isLoading: bjjLoading, error: bjjError } = useBjjRadar(days)
  const { data: fisicoData, isLoading: fisicoLoading, error: fisicoError } = useFisicoRadar(days)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold">Análisis</h1>
          <p className="text-muted-foreground text-sm">Tu evolución como peleador</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {PERIOD_OPTIONS.map(o => (
            <PeriodButton key={o.days} active={days === o.days} onClick={() => setDays(o.days)}>
              {o.label}
            </PeriodButton>
          ))}
        </div>
      </div>

      {/* Radar grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TabGroup
          label="Jiu-Jitsu Brasileño"
          tabs={BJJ_TABS}
          activeId={activeBjj}
          onSelect={setActiveBjj}
          bjjData={bjjData}
          bjjLoading={bjjLoading}
          bjjError={bjjError}
          fisicoData={fisicoData}
          fisicoLoading={fisicoLoading}
          fisicoError={fisicoError}
        />
        <TabGroup
          label="Preparación Física"
          tabs={FISICO_TABS}
          activeId={activeFisico}
          onSelect={setActiveFisico}
          bjjData={bjjData}
          bjjLoading={bjjLoading}
          bjjError={bjjError}
          fisicoData={fisicoData}
          fisicoLoading={fisicoLoading}
          fisicoError={fisicoError}
        />
      </div>
    </div>
  )
}
