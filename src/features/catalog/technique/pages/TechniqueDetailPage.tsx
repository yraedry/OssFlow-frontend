import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { TechniqueForm } from '../components/TechniqueForm'
import { useTechnique, useUpdateTechnique } from '../hooks'
import type { CreateTechniqueForm } from '../schemas'

function getYouTubeEmbedId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const BELT_COLORS: Record<string, string> = {
  WHITE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  BLUE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PURPLE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  BROWN: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  BLACK: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
}

const BELT_LABELS: Record<string, string> = {
  WHITE: 'Blanco',
  BLUE: 'Azul',
  PURPLE: 'Morado',
  BROWN: 'Marrón',
  BLACK: 'Negro',
}

const MODALITY_LABELS: Record<string, string> = {
  GI: 'Gi',
  NOGI: 'No-Gi',
  BOTH: 'Ambas',
}

export function TechniqueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data: technique, isLoading, error } = useTechnique(Number(id))
  const updateMutation = useUpdateTechnique()

  const handleSubmit = async (formData: CreateTechniqueForm) => {
    if (!technique) return
    const payload = { ...formData, youtubeUrl: formData.youtubeUrl || undefined }
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
          onClick={() => navigate('/catalog/techniques')}
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
            <Badge variant="secondary">{MODALITY_LABELS[technique.modality]}</Badge>
            <Badge variant={technique.visibility === 'PUBLIC' ? 'default' : 'outline'}>
              {technique.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
            </Badge>
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

        {technique.youtubeUrl && (() => {
          const embedId = getYouTubeEmbedId(technique.youtubeUrl)
          return (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Video</p>
                <a
                  href={technique.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  YouTube
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {embedId ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full border border-border"
                    src={`https://www.youtube.com/embed/${embedId}`}
                    title={technique.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={technique.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm hover:underline"
                >
                  Ver video
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )
        })()}

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
