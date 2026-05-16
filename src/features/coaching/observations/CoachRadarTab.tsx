import { useObservationRadar, useTechniqueFamilies } from '../hooks'
import { RadarPanel, type Section } from '@/components/charts/RadarPanel'
import type { RadarDataPoint } from '@/features/analisis/radar/types'

type Props = { athleteId: number }

const COACH_RADAR_BASE: Omit<Section, 'families'> = {
  id: 'coach',
  label: 'Observaciones',
  color: '#f97316',
  source: 'coach',
  title: 'Radar del maestro',
  subtitle: 'puntos',
  emptyHint: 'Añade observaciones con familia técnica para ver el radar del alumno.',
}

export function CoachRadarTab({ athleteId }: Props) {
  const { data: radarPoints, isLoading, error } = useObservationRadar(athleteId)
  const { data: families } = useTechniqueFamilies()

  // Map RadarPoint[] (family + score) → RadarDataPoint[] (family + label + value)
  const data: RadarDataPoint[] | undefined = radarPoints?.map(p => ({
    family: p.family,
    label: families?.find(f => f.value === p.family)?.label ?? p.family.replace(/_/g, ' '),
    value: p.score,
  }))

  const section: Section = {
    ...COACH_RADAR_BASE,
    families: data?.map(d => d.family) ?? [],
  }

  if (!isLoading && data && data.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="text-sm text-muted-foreground max-w-[260px]">
          {data.length === 0
            ? 'Añade observaciones con familia técnica para ver el radar del alumno.'
            : `Necesitas al menos 3 familias con datos para ver el radar (tienes ${data.length}).`}
        </p>
      </div>
    )
  }

  // El radar del maestro puede tener scores negativos: usamos domain 'auto'.
  return <RadarPanel section={section} data={data} isLoading={isLoading} error={error} radiusDomain={['auto', 'auto']} />
}
