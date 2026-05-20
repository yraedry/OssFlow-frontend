import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus } from 'lucide-react'
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
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreateCompetitionLogForm) => {
    await createMutation.mutateAsync(formData)
    setOpen(false)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar esta competencia? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const handleClick = (log: CompetitionLog) => {
    navigate(`/diario/competicion/${log.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Diario
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Competición
          </h1>
        </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Nueva
              </button>
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
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <p className="text-sm font-medium">No hay competencias registradas</p>
          <p className="text-xs mt-1">Registra tu primera competencia con el botón de arriba</p>
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
