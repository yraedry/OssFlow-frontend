import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { StudyPlanCard } from '../components/StudyPlanCard'
import { StudyPlanForm } from '../components/StudyPlanForm'
import { useStudyPlans, useCreateStudyPlan, useDeleteStudyPlan } from '../hooks'
import type { StudyPlan } from '../types'
import type { CreateStudyPlanFormOutput } from '../schemas'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

export function StudyPlansPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { data, isLoading, error } = useStudyPlans()
  const createMutation = useCreateStudyPlan()
  const deleteMutation = useDeleteStudyPlan()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreateStudyPlanFormOutput) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar este plan? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const handleClick = (plan: StudyPlan) => {
    navigate(`/planificacion/planes/${plan.id}`)
  }

  const plans = data?.content ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border border-border bg-card px-5 py-4 flex items-center justify-between">
        <div>
          <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>Planificación</div>
          <h1 className="font-black leading-none" style={{ ...SERIF, fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.02em' }}>
            Planes de Estudio
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {plans.length > 0 && (
            <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>
              {plans.length} {plans.length === 1 ? 'plan' : 'planes'}
            </span>
          )}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:opacity-85 transition-opacity"
            style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Nuevo plan
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar los planes</AlertDescription>
        </Alert>
      ) : plans.length === 0 ? (
        <div className="border border-border border-dashed bg-card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border border-border flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold" style={SERIF}>Sin planes todavía</p>
            <p className="text-sm text-muted-foreground mt-1" style={MONO}>
              Crea tu primer plan de estudio para organizar tu progreso en BJJ
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
            style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Crear plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <StudyPlanCard key={plan.id} plan={plan} onClick={handleClick} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo plan de estudio</DialogTitle>
          </DialogHeader>
          <StudyPlanForm onSubmit={handleSubmit} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
