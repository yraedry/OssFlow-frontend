import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { CompetitionLogCard } from '../components/CompetitionLogCard'
import { CompetitionLogForm } from '../components/CompetitionLogForm'
import { useCompetitionLogs, useCreateCompetitionLog, useDeleteCompetitionLog } from '../hooks'
import type { CompetitionLog } from '../types'
import type { CreateCompetitionLogForm } from '../schemas'

export function CompetitionLogsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const { data, isLoading, error } = useCompetitionLogs({ page: currentPage, size: 20 })
  const createMutation = useCreateCompetitionLog()
  const deleteMutation = useDeleteCompetitionLog()

  const handleSubmit = async (formData: CreateCompetitionLogForm) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta competencia?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleClick = (log: CompetitionLog) => {
    navigate(`/competition/logs/${log.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competencias</h1>
          <p className="text-muted-foreground">{data?.totalElements ?? 0} competencias en total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Competencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva competencia</DialogTitle>
            </DialogHeader>
            <CompetitionLogForm onSubmit={handleSubmit} isPending={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar las competencias</AlertDescription>
        </Alert>
      ) : ((data?.content ?? []).filter(Boolean)).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay competencias todavía.</p>
          <p className="text-sm">Registra tu primera competencia con el botón de arriba.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.content ?? []).filter(Boolean).map((log) => (
              <CompetitionLogCard key={log.id} log={log} onClick={handleClick} onDelete={handleDelete} />
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
