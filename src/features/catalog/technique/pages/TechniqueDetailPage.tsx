import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { TechniqueForm } from '../components/TechniqueForm'
import { useTechnique, useUpdateTechnique } from '../hooks'
import type { CreateTechniqueForm } from '../schemas'
import { YouTubePlayerModal } from '@/shared/components/ui/youtube-player-modal'

// S3.10: Reemplazadas clases dark: hardcoded por tokens del sistema de diseño.
const BELT_COLORS: Record<string, string> = {
  WHITE: 'bg-muted text-muted-foreground',
  BLUE: 'bg-muted text-foreground border border-border',
  PURPLE: 'bg-muted text-foreground border border-border',
  BROWN: 'bg-muted text-foreground border border-border',
  BLACK: 'bg-foreground text-background',
}

const BELT_LABELS: Record<string, string> = {
  WHITE: 'Blanco',
  BLUE: 'Azul',
  PURPLE: 'Morado',
  BROWN: 'Marrón',
  BLACK: 'Negro',
}

function ModalityBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
      {label}
    </span>
  )
}

function ModalityBadges({ modality }: { modality: string }) {
  if (modality === 'BOTH') return <><ModalityBadge label="Gi" /><ModalityBadge label="No-Gi" /></>
  if (modality === 'GI') return <ModalityBadge label="Gi" />
  return <ModalityBadge label="No-Gi" />
}

export function TechniqueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data: technique, isLoading, error } = useTechnique(Number(id))
  const updateMutation = useUpdateTechnique()

  const handleSubmit = async (formData: CreateTechniqueForm) => {
    if (!technique) return
    const payload: Partial<typeof formData> = { ...formData }
    if (!payload.youtubeUrl) delete payload.youtubeUrl
    await updateMutation.mutateAsync({ id: technique.id, data: payload })
    setEditOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  if (error || !technique) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar la técnica</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/estudio/tecnicas')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button onClick={() => setEditOpen(true)} className="gap-2">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{technique.name}</h1>
          <div className="flex gap-2 flex-wrap mt-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BELT_COLORS[technique.minimumBelt]}`}
            >
              {BELT_LABELS[technique.minimumBelt]}
            </span>
            <ModalityBadges modality={technique.modality} />
          </div>
        </div>

        {technique.startPositionName && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Posición de inicio</p>
            <p className="text-sm mt-1">{technique.startPositionName}</p>
          </div>
        )}

        {technique.endPositionName && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Posición de fin</p>
            <p className="text-sm mt-1">{technique.endPositionName}</p>
          </div>
        )}

        {technique.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Descripción</p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{technique.description}</p>
          </div>
        )}

        {technique.youtubeUrl && (
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Video</p>
            <div className="max-w-sm">
              <YouTubePlayerModal url={technique.youtubeUrl} title={technique.name} compact />
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
          <p>Creada: {new Date(technique.createdAt).toLocaleDateString('es-ES')}</p>
          <p>Actualizada: {new Date(technique.updatedAt).toLocaleDateString('es-ES')}</p>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar técnica</DialogTitle>
          </DialogHeader>
          <TechniqueForm
            defaultValues={technique}
            onSubmit={handleSubmit}
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
