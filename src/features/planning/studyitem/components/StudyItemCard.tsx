import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import type { StudyItem, ItemStatus } from '../types'

type StudyItemCardProps = {
  item: StudyItem
  onTransition: (itemId: number, targetStatus: ItemStatus) => void
  onDelete: (itemId: number) => void
}

export function StudyItemCard({ item, onTransition, onDelete }: StudyItemCardProps) {
  return (
    <Card className="text-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <p className="font-medium leading-tight">{item.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {item.status === 'TODO' && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => onTransition(item.id, 'DOING')}
            >
              Iniciar
            </Button>
          )}
          {item.status === 'DOING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2 text-green-700 border-green-300 hover:bg-green-50"
                onClick={() => onTransition(item.id, 'DONE')}
              >
                Completar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2 text-orange-700 border-orange-300 hover:bg-orange-50"
                onClick={() => onTransition(item.id, 'SKIPPED')}
              >
                Saltar
              </Button>
            </>
          )}
          {(item.status === 'DONE' || item.status === 'SKIPPED') && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => onTransition(item.id, 'TODO')}
            >
              Reabrir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
