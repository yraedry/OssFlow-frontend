import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import type { CompetitionMatch } from '../types'

type MatchCardProps = {
  match: CompetitionMatch
  onDelete: (matchId: number) => void
}

// S3.10: Reemplazadas clases dark: hardcoded por tokens del sistema de diseño.
const resultColors: Record<CompetitionMatch['result'], string> = {
  WIN: 'bg-muted text-foreground border border-border',
  LOSS: 'bg-muted text-destructive border border-destructive/30',
  DRAW: 'bg-muted text-muted-foreground border border-border',
}

const resultLabels: Record<CompetitionMatch['result'], string> = {
  WIN: 'Victoria',
  LOSS: 'Derrota',
  DRAW: 'Empate',
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MatchCard({ match, onDelete }: MatchCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${resultColors[match.result]}`}
              >
                {resultLabels[match.result]}
              </span>
              <span className="font-medium text-sm">{match.opponentName}</span>
              {match.opponentBelt && (
                <Badge variant="outline" className="text-xs">
                  {match.opponentBelt}
                </Badge>
              )}
              {match.duration !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(match.duration)}
                </span>
              )}
            </div>
            {match.technique && (
              <p className="text-sm text-muted-foreground">
                Técnica: <span className="font-medium">{match.technique}</span>
              </p>
            )}
            {match.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">{match.notes}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
            onClick={() => onDelete(match.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
