import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, MapPin, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import type { CompetitionLog } from '../types'

type CompetitionLogCardProps = {
  log: CompetitionLog
  onClick: (log: CompetitionLog) => void
  onDelete: (id: number) => void
}

// eslint-disable-next-line react-refresh/only-export-components
function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: es })
}

const modalityVariant: Record<CompetitionLog['modality'], 'default' | 'secondary' | 'outline'> = {
  GI: 'default',
  NOGI: 'secondary',
  BOTH: 'outline',
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
        {log.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{log.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={modalityVariant[log.modality]}>{log.modality}</Badge>
          {log.weightClass && (
            <span className="text-xs text-muted-foreground">{log.weightClass}</span>
          )}
        </div>
        {log.result && (
          <p className="text-sm font-medium">{log.result}</p>
        )}
      </CardContent>
    </Card>
  )
}
