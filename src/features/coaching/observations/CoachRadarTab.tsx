import { useState } from 'react'
import { useObservationRadar, useTechniqueFamilies } from '../hooks'
import { RadarPanel, type Section } from '@/components/charts/RadarPanel'
import { Spinner } from '@/shared/components/ui/spinner'
import { AlertTriangle } from 'lucide-react'

type Props = { athleteId: number }

// Todas las familias agrupadas en secciones como en /analisis
const SECTIONS: Section[] = [
  {
    id: 'guardias',
    label: 'Guardias',
    color: '#f97316',
    source: 'coach',
    families: ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT', 'DLR_GUARD', 'GUARD'],
    title: 'Guardias',
    subtitle: 'pts',
    emptyHint: 'Sin observaciones sobre guardias aún.',
  },
  {
    id: 'sumisiones',
    label: 'Sumisiones',
    color: '#e11d48',
    source: 'coach',
    families: ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS', 'SUBMISSIONS'],
    title: 'Sumisiones',
    subtitle: 'pts',
    emptyHint: 'Sin observaciones sobre sumisiones aún.',
  },
  {
    id: 'pasajes',
    label: 'Pasajes',
    color: '#0ea5e9',
    source: 'coach',
    families: ['GUARD_PASSES', 'PASSING'],
    title: 'Pasajes',
    subtitle: 'pts',
    emptyHint: 'Sin observaciones sobre pasajes aún.',
  },
  {
    id: 'derribos',
    label: 'Derribos',
    color: '#a855f7',
    source: 'coach',
    families: ['TAKEDOWNS', 'SWEEPS', 'BACK_TAKES', 'ESCAPES', 'WRESTLING', 'BACK_CONTROL'],
    title: 'Derribos y Movimiento',
    subtitle: 'pts',
    emptyHint: 'Sin observaciones sobre derribos aún.',
  },
]

type SectionId = 'guardias' | 'sumisiones' | 'pasajes' | 'derribos'

export function CoachRadarTab({ athleteId }: Props) {
  const { data: radarPoints, isLoading } = useObservationRadar(athleteId)
  const { data: families } = useTechniqueFamilies()
  const [active, setActive] = useState<SectionId>('guardias')

  const getLabel = (family: string) =>
    families?.find(f => f.value === family)?.label ?? family.replace(/_/g, ' ')

  // Mapear RadarPoint[] → RadarDataPoint[] (family + label + value)
  const allPoints = (radarPoints ?? []).map(p => ({
    family: p.family,
    label: getLabel(p.family),
    value: p.score,
  }))

  const section = SECTIONS.find(s => s.id === active)!

  // Top 5 de todas las familias con score positivo
  const top5 = [...allPoints]
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  const maxVal = top5[0]?.value ?? 1

  // Secciones sin ningún dato positivo
  const gaps = SECTIONS.filter(s => {
    const total = allPoints
      .filter(p => s.families.includes(p.family) && p.value > 0)
      .reduce((acc, p) => acc + p.value, 0)
    return total === 0
  })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Radar — 2/3 */}
      <div
        className="lg:col-span-2 border border-border bg-card overflow-hidden"
        style={{ borderTop: `3px solid ${section.color}` }}
      >
        {/* Tabs de sección */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id as SectionId)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-mono uppercase tracking-wide transition-colors border-b-2 cursor-pointer ${
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

        {/* Título + total */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-base font-semibold">{section.title}</p>
            <p className="text-xs text-muted-foreground font-mono">Basado en observaciones del maestro</p>
          </div>
          {allPoints.filter(p => section.families.includes(p.family) && p.value > 0).length > 0 && (
            <span className="text-3xl font-bold tabular-nums" style={{ color: section.color }}>
              {allPoints
                .filter(p => section.families.includes(p.family) && p.value > 0)
                .reduce((acc, p) => acc + p.value, 0)}
            </span>
          )}
        </div>

        <div className="px-4 pb-4">
          <RadarPanel
            section={section}
            data={allPoints}
            isLoading={isLoading}
            error={null}
            radiusDomain={['auto', 'auto']}
          />
        </div>
      </div>

      {/* Sidebar — 1/3 */}
      <div className="space-y-4">
        {top5.length > 0 && (
          <div className="border border-border bg-card px-4 py-4 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Top técnicas</p>
            {top5.map((d, i) => (
              <div key={d.family} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}.</span>
                <span className="text-xs flex-1 truncate">{d.label}</span>
                <div className="h-1 w-16 bg-border">
                  <div
                    className="h-1 transition-all"
                    style={{ width: `${(d.value / maxVal) * 100}%`, backgroundColor: '#f97316' }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums text-orange-500 w-5 text-right">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {gaps.length > 0 && (
          <div className="border border-border bg-card px-4 py-4 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Áreas sin datos</p>
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

        {top5.length === 0 && gaps.length === 0 && (
          <div className="border border-border bg-card px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              Añade observaciones con familia técnica para ver el análisis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
