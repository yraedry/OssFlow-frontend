import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { StudyItemKanban } from '@/features/planning/studyitem/components/StudyItemKanban'
import { useCreateStudyItem } from '@/features/planning/studyitem/hooks'
import { StudyItemForm } from './StudyItemForm'
import type { StudyBlock } from '../types'
import type { CreateStudyItemForm } from '@/features/planning/studyitem/schemas'

type StudyBlockCardProps = {
  block: StudyBlock
  planId: number
  onDelete: (blockId: number) => void
}

export function StudyBlockCard({ block, planId, onDelete }: StudyBlockCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const createItem = useCreateStudyItem(planId, block.id)

  const handleAddItem = async (data: CreateStudyItemForm) => {
    await createItem.mutateAsync(data)
    setItemDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-left flex-1 min-w-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <CardTitle className="text-base truncate">{block.title}</CardTitle>
            {block.weekNumber && (
              <span className="text-xs text-muted-foreground shrink-0">
                Semana {block.weekNumber}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir ítem</DialogTitle>
                </DialogHeader>
                <StudyItemForm onSubmit={handleAddItem} isPending={createItem.isPending} />
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(block.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          {block.description && (
            <p className="text-sm text-muted-foreground mb-3">{block.description}</p>
          )}
          <StudyItemKanban planId={planId} blockId={block.id} />
        </CardContent>
      )}
    </Card>
  )
}
