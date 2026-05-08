import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConfirm } from '@/shared/components/ui/confirm-dialog'
import { ArrowLeft, Plus, BarChart2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { StudyBlockCard } from '@/features/planning/studyblock/components/StudyBlockCard'
import { StudyBlockForm } from '@/features/planning/studyblock/components/StudyBlockForm'
import { useStudyBlocks, useCreateStudyBlock, useDeleteStudyBlock } from '@/features/planning/studyblock/hooks'
import { useStudyPlan } from '../hooks'
import type { CreateStudyBlockForm } from '@/features/planning/studyblock/schemas'
import type { CreateStudyBlockRequest } from '@/features/planning/studyblock/types'

export function StudyPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const planId = Number(id)
  const navigate = useNavigate()
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)

  const { data: plan, isLoading: planLoading, error: planError } = useStudyPlan(planId)
  const { data: blocksData, isLoading: blocksLoading } = useStudyBlocks(planId)
  const createBlock = useCreateStudyBlock(planId)
  const deleteBlock = useDeleteStudyBlock(planId)
  const confirm = useConfirm()

  const handleAddBlock = async (data: CreateStudyBlockForm) => {
    await createBlock.mutateAsync(data as CreateStudyBlockRequest)
    setBlockDialogOpen(false)
  }

  const handleDeleteBlock = async (blockId: number) => {
    const ok = await confirm({ description: '¿Eliminar este bloque? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteBlock.mutateAsync(blockId)
  }

  if (planLoading) return <div className="flex justify-center p-8"><Spinner /></div>
  if (planError || !plan)
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar el plan</AlertDescription>
      </Alert>
    )

  const blocks = blocksData?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/planning/study-plans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{plan.title}</h1>
          {plan.goalMarkdown && (
            <p className="text-muted-foreground text-sm">{plan.goalMarkdown}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => navigate(`/planning/study-plans/${planId}/timeline`)}>
          <BarChart2 className="h-4 w-4 mr-2" />
          Ver Timeline
        </Button>
        <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Bloque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo bloque</DialogTitle>
            </DialogHeader>
            <StudyBlockForm onSubmit={handleAddBlock} isPending={createBlock.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {blocksLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay bloques todavía.</p>
          <p className="text-sm">Añade tu primer bloque con el botón de arriba.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block) => (
            <StudyBlockCard
              key={block.id}
              block={block}
              planId={planId}
              onDelete={handleDeleteBlock}
            />
          ))}
        </div>
      )}
    </div>
  )
}
