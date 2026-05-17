import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trophy, Trash2 } from 'lucide-react'
import type { CompetitionLog } from '../types'

type CompetitionLogCardProps = {
  log: CompetitionLog
  onClick: (log: CompetitionLog) => void
  onDelete: (id: number) => void
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'd MMM yyyy', { locale: es })
  } catch {
    return dateStr
  }
}

const RESULT_ACCENT: Record<string, string> = {
  ORO:   '#f59e0b',
  PLATA: '#94a3b8',
  BRONCE:'#b45309',
}

function getResultAccent(result: string) {
  const upper = result.toUpperCase()
  if (upper.includes('ORO') || upper.includes('1') || upper.includes('GOLD')) return RESULT_ACCENT.ORO
  if (upper.includes('PLATA') || upper.includes('2') || upper.includes('SILVER')) return RESULT_ACCENT.PLATA
  if (upper.includes('BRONCE') || upper.includes('3') || upper.includes('BRONZE')) return RESULT_ACCENT.BRONCE
  return '#64748b'
}

export function CompetitionLogCard({ log, onClick, onDelete }: CompetitionLogCardProps) {
  const resultColor = log.result ? getResultAccent(log.result) : '#64748b'

  return (
    <div
      className="group relative flex flex-col bg-card border border-border cursor-pointer hover:border-foreground/40 transition-colors"
      style={{ borderLeft: `3px solid ${resultColor}` }}
      onClick={() => onClick(log)}
    >
      {/* Acción eliminar — solo en hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          aria-label="Eliminar competición"
          onClick={(e) => { e.stopPropagation(); onDelete(log.id) }}
          className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          Competición
        </span>
        <p className="text-sm font-semibold leading-snug pr-10">{log.eventName}</p>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          <Calendar className="h-3 w-3" strokeWidth={1.5} />
          <span>{formatDate(log.eventDate)}</span>
          {log.weightCategory && <span>· {log.weightCategory}</span>}
        </div>
      </div>

      {(log.result || log.totalMatches != null || log.winsCount != null || log.lossesCount != null) && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {log.totalMatches != null && (
              <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                {log.totalMatches} combates
              </span>
            )}
            {(log.winsCount != null || log.lossesCount != null) && (
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
                {log.winsCount != null && <span className="text-emerald-500">{log.winsCount}V</span>}
                {log.winsCount != null && log.lossesCount != null && <span className="text-muted-foreground mx-0.5">·</span>}
                {log.lossesCount != null && <span className="text-destructive">{log.lossesCount}D</span>}
              </span>
            )}
          </div>
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
}
