import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { StudyPlanCard } from '../components/StudyPlanCard'
import { StudyPlanForm } from '../components/StudyPlanForm'
import { useStudyPlans, useCreateStudyPlan, useDeleteStudyPlan } from '../hooks'
import type { StudyPlan } from '../types'
import type { CreateStudyPlanForm } from '../schemas'

export function StudyPlansPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { data, isLoading, error } = useStudyPlans()
  const createMutation = useCreateStudyPlan()
  const deleteMutation = useDeleteStudyPlan()

  const handleSubmit = async (formData: CreateStudyPlanForm) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este plan?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleClick = (plan: StudyPlan) => {
    navigate(`/planning/study-plans/${plan.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planes de Estudio</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} planes en total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo plan de estudio</DialogTitle>
            </DialogHeader>
            <StudyPlanForm onSubmit={handleSubmit} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar los planes</AlertDescription>
        </Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay planes todavía.</p>
          <p className="text-sm">Crea tu primer plan con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.content ?? []).map((plan) => (
            <StudyPlanCard key={plan.id} plan={plan} onClick={handleClick} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
