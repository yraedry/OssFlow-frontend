import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import type { CompetitionMatch } from '../types'

type MatchCardProps = {
  match: CompetitionMatch
  onDelete: (matchId: number) => void
}

const outcomeColors: Record<string, string> = {
  WIN:  'bg-muted text-foreground border border-border',
  LOSS: 'bg-muted text-destructive border border-destructive/30',
  DRAW: 'bg-muted text-muted-foreground border border-border',
}

const outcomeLabels: Record<string, string> = {
  WIN:  'Victoria',
  LOSS: 'Derrota',
  DRAW: 'Empate',
}

export function MatchCard({ match, onDelete }: MatchCardProps) {
  const outcomeColor = match.outcome ? (outcomeColors[match.outcome] ?? 'bg-muted text-muted-foreground border border-border') : undefined
  const outcomeLabel = match.outcome ? (outcomeLabels[match.outcome] ?? match.outcome) : undefined

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {outcomeLabel && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${outcomeColor}`}>
                  {outcomeLabel}
                </span>
              )}
              {match.opponentName && (
                <span className="font-medium text-sm">{match.opponentName}</span>
              )}
              {match.opponentTeam && (
                <Badge variant="outline" className="text-xs">
                  {match.opponentTeam}
                </Badge>
              )}
              {match.round && (
                <span className="text-xs text-muted-foreground">{match.round}</span>
              )}
            </div>
            {(match.techniqueText || match.method) && (
              <p className="text-sm text-muted-foreground">
                {match.method && <span>{match.method}</span>}
                {match.method && match.techniqueText && <span> · </span>}
                {match.techniqueText && <span className="font-medium">{match.techniqueText}</span>}
              </p>
            )}
            {match.notesMarkdown && (
              <p className="text-sm text-muted-foreground line-clamp-2">{match.notesMarkdown}</p>
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
