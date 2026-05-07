import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trophy, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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

export function CompetitionLogCard({ log, onClick, onDelete }: CompetitionLogCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(log)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{log.eventName}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(log.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(log.eventDate)}</span>
        </div>
        {log.weightCategory && (
          <p className="text-sm text-muted-foreground">{log.weightCategory}</p>
        )}
        {log.totalMatches != null && (
          <p className="text-sm text-muted-foreground">{log.totalMatches} combates</p>
        )}
        {log.result && (
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
            <p className="text-sm font-medium">{log.result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
