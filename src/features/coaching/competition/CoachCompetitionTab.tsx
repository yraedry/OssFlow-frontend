import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trophy, MapPin } from 'lucide-react'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { useAthleteCompetitionLogs } from '@/features/competition/log/hooks'
import { GI_NOGI_OPTIONS, CATEGORY_AGE_OPTIONS } from '@/features/competition/log/types'

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'd MMM yyyy', { locale: es })
  } catch {
    return dateStr
  }
}

function labelFor<T extends { value: string; label: string }>(options: readonly T[], value: string | undefined) {
  return options.find(o => o.value === value)?.label ?? value
}

const RESULT_ACCENT: Record<string, string> = {
  ORO:    '#f59e0b',
  PLATA:  '#94a3b8',
  BRONCE: '#b45309',
}

function getResultAccent(result: string) {
  const upper = result.toUpperCase()
  if (upper.includes('ORO') || upper.includes('1') || upper.includes('GOLD')) return RESULT_ACCENT.ORO
  if (upper.includes('PLATA') || upper.includes('2') || upper.includes('SILVER')) return RESULT_ACCENT.PLATA
  if (upper.includes('BRONCE') || upper.includes('3') || upper.includes('BRONZE')) return RESULT_ACCENT.BRONCE
  return '#64748b'
}

type CoachCompetitionTabProps = {
  athleteId: number
}

export function CoachCompetitionTab({ athleteId }: CoachCompetitionTabProps) {
  const { data, isLoading, error } = useAthleteCompetitionLogs(athleteId)

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar las competencias del atleta</AlertDescription>
      </Alert>
    )

  const logs = data?.content ?? []

  if (logs.length === 0)
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">Este atleta no tiene competencias registradas.</p>
      </div>
    )

  return (
    <div className="space-y-3">
      {logs.map(log => {
        const resultColor = log.result ? getResultAccent(log.result) : '#64748b'
        return (
          <div
            key={log.id}
            className="flex flex-col bg-card border border-border"
            style={{ borderLeft: `3px solid ${resultColor}` }}
          >
            <div className="p-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                Competición
              </span>
              <p className="text-sm font-semibold leading-snug">{log.eventName}</p>

              <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" strokeWidth={1.5} />
                  {formatDate(log.eventDate)}
                </span>
                {log.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" strokeWidth={1.5} />
                    {log.location}
                  </span>
                )}
                {log.weightCategory && <span>· {log.weightCategory}</span>}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {log.giNogi && (
                  <Badge variant="outline" className="text-[10px] py-0">
                    {labelFor(GI_NOGI_OPTIONS, log.giNogi)}
                  </Badge>
                )}
                {log.categoryAge && (
                  <Badge variant="outline" className="text-[10px] py-0">
                    {labelFor(CATEGORY_AGE_OPTIONS, log.categoryAge)}
                  </Badge>
                )}
              </div>
            </div>

            {(log.result || log.totalMatches != null) && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
                {log.totalMatches != null && (
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    {log.totalMatches} combates
                  </span>
                )}
                {log.result && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: resultColor }}>
                    <Trophy className="h-2.5 w-2.5" strokeWidth={1.5} />
                    {log.result}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
