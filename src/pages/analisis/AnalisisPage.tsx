import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { useBjjRadar, useFisicoRadar } from '@/features/analisis/radar/hooks'
import type { RadarDataPoint } from '@/features/analisis/radar/types'
import { fetchWeeklyStats, type WeeklyStats } from '@/shared/api/dashboard'
import { RadarPanel, type Section, type SectionId } from '@/components/charts/RadarPanel'

const PERIOD_OPTIONS = [
  { label: '30d',  days: 30 },
  { label: '90d',  days: 90 },
  { label: '6m',   days: 180 },
  { label: '1a',   days: 365 },
  { label: 'Todo', days: 3650 },
]

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

export function AnalisisPage() {
  const [days, setDays] = useState(90)
  const [active, setActive] = useState<SectionId>('guardias')

  const { data: bjjData, isLoading: bjjLoading, error: bjjError } = useBjjRadar(days)
  const { data: fisicoData, isLoading: fisicoLoading, error: fisicoError } = useFisicoRadar(days)
  const { data: stats } = useQuery<WeeklyStats>({ queryKey: ['weekly-stats'], queryFn: fetchWeeklyStats })

  const section = SECTIONS.find(s => s.id === active)!
  const data    = section.source === 'bjj' ? bjjData : fisicoData
  const loading = section.source === 'bjj' ? bjjLoading : fisicoLoading
  const error   = section.source === 'bjj' ? bjjError : fisicoError
  const total   = (data?.filter(d => section.families.includes(d.family)) ?? []).reduce((s, d) => s + d.value, 0)

  const allBjjPoints: RadarDataPoint[] = bjjData ?? []
  const top5 = [...allBjjPoints].sort((a, b) => b.value - a.value).slice(0, 5)
  const maxVal = top5[0]?.value ?? 1

  const gaps = SECTIONS.filter(s => {
    const src = s.source === 'bjj' ? bjjData : fisicoData
    const t = (src?.filter(d => s.families.includes(d.family)) ?? []).reduce((acc, d) => acc + d.value, 0)
    return t === 0
  })

  const bjjStatPct = stats ? Math.min(100, Math.round((stats.bjjSessions / (stats.bjjGoal || 1)) * 100)) : 0
  const physStatPct = stats ? Math.min(100, Math.round((stats.physicalSessions / (stats.physicalGoal || 1)) * 100)) : 0

  return (
    <div className="space-y-4">

      {/* Header + periodo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Análisis</h1>
          <p className="text-muted-foreground text-sm">Tu evolución como peleador</p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {PERIOD_OPTIONS.map(o => (
            <button
              key={o.days}
              onClick={() => setDays(o.days)}
              className={`px-3 py-1.5 text-xs font-mono border flex-shrink-0 transition-colors ${
                days === o.days
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-muted-foreground border-border hover:border-foreground hover:text-foreground'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1 p-3 bg-card border border-border" style={{ borderLeft: '3px solid #f97316' }}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Racha activa</span>
            <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#f97316' }}>{stats.streakDays}</span>
            <span className="text-[10px] text-muted-foreground">días</span>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-card border border-border" style={{ borderLeft: '3px solid #3b82f6' }}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">BJJ esta semana</span>
            <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#3b82f6' }}>{stats.bjjSessions}<span className="text-sm font-normal text-muted-foreground">/{stats.bjjGoal}</span></span>
            <div className="h-0.5 bg-border mt-1"><div className="h-0.5 transition-all" style={{ width: `${bjjStatPct}%`, backgroundColor: '#3b82f6' }} /></div>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-card border border-border" style={{ borderLeft: '3px solid #10b981' }}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Físico esta semana</span>
            <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#10b981' }}>{stats.physicalSessions}<span className="text-sm font-normal text-muted-foreground">/{stats.physicalGoal}</span></span>
            <div className="h-0.5 bg-border mt-1"><div className="h-0.5 transition-all" style={{ width: `${physStatPct}%`, backgroundColor: '#10b981' }} /></div>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-card border border-border" style={{ borderLeft: '3px solid #a855f7' }}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Técnicas este mes</span>
            <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#a855f7' }}>{stats.techniquesThisMonth}</span>
          </div>
        </div>
      )}

      {/* Layout 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Radar — ocupa 2/3 en desktop */}
        <div className="lg:col-span-2 border border-border bg-card overflow-hidden" style={{ borderTop: `3px solid ${section.color}` }}>
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
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <p className="text-base font-semibold">{section.title}</p>
              {total > 0 && <p className="text-xs text-muted-foreground font-mono">{total} {section.subtitle}</p>}
            </div>
            {total > 0 && (
              <span className="text-3xl font-bold tabular-nums" style={{ color: section.color }}>{total}</span>
            )}
          </div>
          <div className="px-4 pb-4">
            <RadarPanel section={section} data={data} isLoading={loading} error={error} />
          </div>
        </div>

        {/* Sidebar — 1/3 en desktop */}
        <div className="space-y-4">
          {top5.length > 0 && (
            <div className="border border-border bg-card px-4 py-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Top técnicas</p>
              {top5.map((d, i) => (
                <div key={d.family} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-xs flex-1 truncate">{d.label}</span>
                  <div className="h-1 w-16 bg-border">
                    <div className="h-1 bg-orange-500 transition-all" style={{ width: `${(d.value / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-orange-500 w-5 text-right">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          {gaps.length > 0 && (
            <div className="border border-border bg-card px-4 py-4 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Áreas sin datos ({days}d)</p>
              <div className="space-y-2">
                {gaps.map(s => (
                  <div key={s.id} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: s.color }} strokeWidth={1.5} />
                    <span className="text-xs font-mono" style={{ color: s.color }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
