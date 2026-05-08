import { Link } from 'react-router-dom'
import { Pencil, Trash2, GitBranch } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { System } from '../types'

type SystemCardProps = {
  system: System
  onEdit: (system: System) => void
  onDelete: (id: number) => void
}

export function SystemCard({ system, onEdit, onDelete }: SystemCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{system.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(system)}
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(system.id)}
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant={system.visibility === 'PUBLIC' ? 'default' : 'outline'}>
          {system.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
        </Badge>
        {system.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{system.description}</p>
        )}
        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <Link to={`/estudio/sistemas/${system.id}/edit`}>
            <GitBranch className="h-3.5 w-3.5" />
            Editar Flow
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
