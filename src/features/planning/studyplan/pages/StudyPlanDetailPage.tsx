import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { ArrowLeft, BarChart2, Plus, Pencil, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { StudyBlockCard } from '@/features/planning/studyblock/components/StudyBlockCard'
import { StudyBlockForm } from '@/features/planning/studyblock/components/StudyBlockForm'
import { useStudyBlocks, useCreateStudyBlock, useDeleteStudyBlock } from '@/features/planning/studyblock/hooks'
import { useStudyPlan, useUpdateStudyPlan } from '../hooks'
import type { CreateStudyBlockForm } from '@/features/planning/studyblock/schemas'
import type { CreateStudyBlockRequest } from '@/features/planning/studyblock/types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador', ACTIVE: 'Activo', COMPLETED: 'Completado', ARCHIVED: 'Archivado',
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6b7280', ACTIVE: '#10b981', COMPLETED: '#3b82f6', ARCHIVED: '#f59e0b',
}

export function StudyPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const planId = Number(id)
  const navigate = useNavigate()
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editGoal, setEditGoal] = useState('')

  const { data: plan, isLoading: planLoading, error: planError } = useStudyPlan(planId)
  const { data: blocksData, isLoading: blocksLoading } = useStudyBlocks(planId)
  const createBlock = useCreateStudyBlock(planId)
  const deleteBlock = useDeleteStudyBlock(planId)
  const updatePlan = useUpdateStudyPlan()
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

  const startEditPlan = () => {
    setEditTitle(plan?.title ?? '')
    setEditGoal(plan?.goalMarkdown ?? '')
    setEditingPlan(true)
  }

  const handleSavePlan = async () => {
    await updatePlan.mutateAsync({ id: planId, data: { title: editTitle, goalMarkdown: editGoal || undefined } })
    setEditingPlan(false)
  }

  if (planLoading) return <div className="flex justify-center p-8"><Spinner /></div>
  if (planError || !plan)
    return <Alert variant="destructive"><AlertDescription>Error al cargar el plan</AlertDescription></Alert>

  const blocks = blocksData?.content ?? []
  const accent = STATUS_COLORS[plan.status] ?? '#6b7280'

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="border border-border bg-card" style={{ borderLeft: `3px solid ${accent}` }}>
        <div className="flex items-start gap-4 px-5 py-4">
          <button
            type="button"
            onClick={() => navigate('/planificacion/planes')}
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            {editingPlan ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-border text-2xl font-black focus:outline-none focus:border-foreground transition-colors pb-0.5"
                  style={{ fontFamily: 'var(--font-serif)' }}
                  placeholder="Título del plan"
                />
                <textarea
                  value={editGoal}
                  onChange={e => setEditGoal(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border border-border px-2 py-1.5 text-sm text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                  style={MONO}
                  placeholder="Objetivo del plan (opcional)"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ ...MONO, color: accent }}>
                    {STATUS_LABELS[plan.status] ?? plan.status}
                  </span>
                  {plan.startDate && (
                    <span className="text-[10px] text-muted-foreground" style={MONO}>
                      {plan.startDate}{plan.endDate ? ` → ${plan.endDate}` : ''}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black leading-tight mt-0.5" style={{ fontFamily: 'var(--font-serif)' }}>
                  {plan.title}
                </h1>
                {plan.goalMarkdown && (
                  <p className="text-sm text-muted-foreground mt-1">{plan.goalMarkdown}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {editingPlan ? (
              <>
                <button type="button" onClick={handleSavePlan} disabled={updatePlan.isPending}
                  className="h-7 w-7 flex items-center justify-center border border-border bg-foreground text-background hover:opacity-85 transition-opacity">
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button type="button" onClick={() => setEditingPlan(false)}
                  className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </>
            ) : (
              <button type="button" onClick={startEditPlan}
                className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(`/planificacion/planes/${planId}/timeline`)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-colors"
              style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              <BarChart2 className="h-3 w-3" strokeWidth={1.5} />
              Timeline
            </button>
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
              <DialogTrigger asChild>
                <button type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background hover:opacity-85 transition-opacity"
                  style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  <Plus className="h-3 w-3" strokeWidth={2} />
                  Añadir bloque
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nuevo bloque</DialogTitle>
                </DialogHeader>
                <StudyBlockForm onSubmit={handleAddBlock} isPending={createBlock.isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats de bloques */}
        {blocks.length > 0 && (
          <div className="border-t border-border/50 px-5 py-2 flex items-center gap-4">
            <span className="text-[10px] text-muted-foreground" style={MONO}>
              {blocks.length} {blocks.length === 1 ? 'bloque' : 'bloques'}
            </span>
          </div>
        )}
      </div>

      {/* Bloques */}
      {blocksLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : blocks.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <p className="text-sm font-medium">No hay bloques todavía</p>
          <p className="text-xs mt-1">Añade tu primer bloque de estudio con el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <StudyBlockCard
              key={block.id}
              block={block}
              planId={planId}
              index={idx + 1}
              onDelete={handleDeleteBlock}
            />
          ))}
        </div>
      )}
    </div>
  )
}
