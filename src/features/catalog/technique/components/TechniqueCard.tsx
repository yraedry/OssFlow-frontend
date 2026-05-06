import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
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

type TechniqueCardProps = {
  technique: Technique
  onEdit: (technique: Technique) => void
  onDelete: (id: number) => void
}

export function TechniqueCard({ technique: t, onEdit, onDelete }: TechniqueCardProps) {
  const navigate = useNavigate()

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
        </div>
        {t.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
