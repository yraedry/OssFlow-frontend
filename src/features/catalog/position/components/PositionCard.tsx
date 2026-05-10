import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { YouTubePlayerModal } from '@/shared/components/ui/youtube-player-modal'
import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Position } from '../types'

const TYPE_LABELS: Record<Position['type'], string> = {
  TOP: 'Posición dominante',
  BOTTOM: 'Posición inferior',
  STANDING: 'De pie',
  GROUND_NEUTRAL: 'Suelo neutral',
  SUBMITTED: 'Sumisión',
}

interface PositionCardProps {
  position: Position
  onEdit: (position: Position) => void
  onDelete: (id: number) => void
}

export function PositionCard({ position, onEdit, onDelete }: PositionCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(`/estudio/posiciones/${position.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{position.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit(position) }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(position.id) }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{TYPE_LABELS[position.type]}</Badge>
        </div>
        {position.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{position.description}</p>
        )}
        {position.youtubeUrl && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <YouTubePlayerModal url={position.youtubeUrl} title={position.name} compact />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
