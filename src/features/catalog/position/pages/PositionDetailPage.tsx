import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePosition } from '../hooks'

const TYPE_LABELS: Record<string, string> = {
  TOP: 'Posición dominante',
  BOTTOM: 'Posición inferior',
  STANDING: 'De pie',
  GROUND_NEUTRAL: 'Suelo neutral',
  SUBMITTED: 'Sumisión',
}

function extractYouTubeId(url: string): string | null {
  const vMatch = url.match(/[?&]v=([^&]+)/)
  if (vMatch) return vMatch[1]
  const embedMatch = url.match(/\/embed\/([^?&/]+)/)
  if (embedMatch) return embedMatch[1]
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/)
  if (shortMatch) return shortMatch[1]
  return null
}

export function PositionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const numericId = Number(id)
  const { data: position, isLoading, error } = usePosition(numericId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !position) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/estudio/posiciones')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Posiciones
        </Button>
        <Alert variant="destructive">
          <AlertDescription>No se pudo cargar la posición.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const videoId = position.youtubeUrl ? extractYouTubeId(position.youtubeUrl) : null

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/estudio/posiciones')} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Posiciones
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{position.name}</h1>
        <Badge variant="secondary">{TYPE_LABELS[position.type] ?? position.type}</Badge>
      </div>

      {videoId && (
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {position.description && (
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Descripción</h2>
          <p className="text-sm leading-relaxed">{position.description}</p>
        </div>
      )}
    </div>
  )
}
