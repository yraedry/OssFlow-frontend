import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import type { Position } from '../types'

const TYPE_LABELS: Record<Position['type'], string> = {
  TOP: 'Top', BOTTOM: 'Bottom', STANDING: 'De pie', GROUND_NEUTRAL: 'Neutral suelo', SUBMITTED: 'Sometido',
}

interface PositionCardProps {
  position: Position
  onEdit: (position: Position) => void
  onDelete: (id: number) => void
}

export function PositionCard({ position, onEdit, onDelete }: PositionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{position.name}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(position)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(position.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{TYPE_LABELS[position.type]}</Badge>
          <Badge variant={position.visibility === 'PUBLIC' ? 'default' : 'outline'}>
            {position.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
          </Badge>
        </div>
        {position.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{position.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
