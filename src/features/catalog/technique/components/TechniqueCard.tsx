import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, MoveRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { YouTubeEmbed } from '@/shared/components/ui/youtube-embed'
import type { Technique } from '../types'

const CATEGORY_COLORS: Record<Technique['category'], string> = {
  SUBMISSION: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  SWEEP:      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  PASS:       'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TAKEDOWN:   'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  ESCAPE:     'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TRANSITION: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const CATEGORY_LABELS: Record<Technique['category'], string> = {
  SUBMISSION: 'Sumisión',
  SWEEP:      'Barrida',
  PASS:       'Pasada',
  TAKEDOWN:   'Derribo',
  ESCAPE:     'Escape',
  TRANSITION: 'Transición',
}

const BELT_COLORS: Record<Technique['minimumBelt'], string> = {
  WHITE:  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  BLUE:   'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PURPLE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  BROWN:  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  BLACK:  'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
}

const BELT_LABELS: Record<Technique['minimumBelt'], string> = {
  WHITE:  'Blanco',
  BLUE:   'Azul',
  PURPLE: 'Morado',
  BROWN:  'Marrón',
  BLACK:  'Negro',
}

type TechniqueCardProps = {
  technique: Technique
  onEdit: (technique: Technique) => void
  onDelete: (id: number) => void
}

export function TechniqueCard({ technique: t, onEdit, onDelete }: TechniqueCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/catalog/techniques/${t.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold leading-tight">{t.name}</CardTitle>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit(t) }}
              aria-label="Editar técnica"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(t.id) }}
              aria-label="Eliminar técnica"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Categoría + cinturón */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[t.category]}`}>
            {CATEGORY_LABELS[t.category]}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BELT_COLORS[t.minimumBelt]}`}>
            {BELT_LABELS[t.minimumBelt]}
          </span>
        </div>

        {/* Posición de inicio → fin */}
        {t.startPositionName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t.startPositionName}</span>
            {t.endPositionName && (
              <>
                <MoveRight className="h-3 w-3 shrink-0" />
                <span className="font-medium text-foreground">{t.endPositionName}</span>
              </>
            )}
          </div>
        )}

        {/* Descripción */}
        {t.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
        )}

        {/* Video */}
        {t.youtubeUrl && (
          <div className="pt-1">
            <YouTubeEmbed url={t.youtubeUrl} title={t.name} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
