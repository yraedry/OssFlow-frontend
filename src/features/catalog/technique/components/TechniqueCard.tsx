import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { Technique } from '../types'

const BELT_COLORS: Record<Technique['minimumBelt'], string> = {
  WHITE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  BLUE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PURPLE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  BROWN: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  BLACK: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
}

const BELT_LABELS: Record<Technique['minimumBelt'], string> = {
  WHITE: 'Blanco',
  BLUE: 'Azul',
  PURPLE: 'Morado',
  BROWN: 'Marrón',
  BLACK: 'Negro',
}

function getYouTubeEmbedId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^?&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

type TechniqueCardProps = {
  technique: Technique
  onEdit: (technique: Technique) => void
  onDelete: (id: number) => void
}

export function TechniqueCard({ technique: t, onEdit, onDelete }: TechniqueCardProps) {
  const navigate = useNavigate()
  const [showVideo, setShowVideo] = useState(false)

  const embedId = t.youtubeUrl ? getYouTubeEmbedId(t.youtubeUrl) : null

  const handleCardClick = () => {
    navigate(`/catalog/techniques/${t.id}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(t)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(t.id)
  }

  const handleVideoToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowVideo(prev => !prev)
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{t.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEdit}
              aria-label="Editar técnica"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              aria-label="Eliminar técnica"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BELT_COLORS[t.minimumBelt]}`}
          >
            {BELT_LABELS[t.minimumBelt]}
          </span>
          <Badge variant="secondary">{t.modality}</Badge>
          <Badge variant={t.visibility === 'PUBLIC' ? 'default' : 'outline'}>
            {t.visibility === 'PUBLIC' ? 'Pública' : 'Privada'}
          </Badge>
          {t.youtubeUrl && embedId && (
            <button
              onClick={handleVideoToggle}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              ▶ Video
            </button>
          )}
          {t.youtubeUrl && !embedId && (
            <a
              href={t.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Video
            </a>
          )}
        </div>
        {t.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>
        )}
        {showVideo && embedId && (
          <div
            className="mt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded"
                src={`https://www.youtube.com/embed/${embedId}`}
                title={`Video: ${t.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
