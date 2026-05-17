import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trophy, MapPin, X } from 'lucide-react'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { useAthleteCompetitionLogs } from '@/features/competition/log/hooks'
import { GI_NOGI_OPTIONS, CATEGORY_AGE_OPTIONS } from '@/features/competition/log/types'
import type { CompetitionLog } from '@/features/competition/log/types'

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

function CompetitionDetailModal({ log, onClose }: { log: CompetitionLog; onClose: () => void }) {
  const resultColor = log.result ? getResultAccent(log.result) : '#64748b'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background shadow-xl flex flex-col"
        style={{ borderLeft: `3px solid ${resultColor}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-orange-500">Competición</p>
            <p className="text-xs text-muted-foreground/60 font-mono">
              {formatDate(log.eventDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Evento</p>
            <p className="text-sm font-medium text-foreground">{log.eventName}</p>
          </div>

          {log.location && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Lugar</p>
              <p className="text-sm text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                {log.location}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {log.weightCategory && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Categoría de peso</p>
                <p className="text-sm text-foreground">{log.weightCategory}</p>
              </div>
            )}
            {log.totalMatches != null && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Combates</p>
                <p className="text-sm text-foreground">{log.totalMatches}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
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

          {log.result && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Resultado</p>
              <span
                className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)', color: resultColor }}
              >
                <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
                {log.result}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type CoachCompetitionTabProps = {
  athleteId: number
}

export function CoachCompetitionTab({ athleteId }: CoachCompetitionTabProps) {
  const { data, isLoading, error } = useAthleteCompetitionLogs(athleteId)
  const [selectedLog, setSelectedLog] = useState<CompetitionLog | null>(null)

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
    <>
      <div className="space-y-1.5 max-w-2xl">
        {logs.map(log => {
          const resultColor = log.result ? getResultAccent(log.result) : '#64748b'
          return (
            <div
              key={log.id}
              className="flex flex-col bg-card border border-border cursor-pointer hover:bg-muted/30 transition-colors"
              style={{ borderLeft: `3px solid ${resultColor}` }}
              onClick={() => setSelectedLog(log)}
            >
              <div className="p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-1">{log.eventName}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground font-mono mt-1">
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
                  </div>
                </div>
                {log.result && (
                  <span
                    className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-mono)', color: resultColor }}
                  >
                    <Trophy className="h-2.5 w-2.5" strokeWidth={1.5} />
                    {log.result}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedLog && (
        <CompetitionDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  )
}
