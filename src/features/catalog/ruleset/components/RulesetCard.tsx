import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import type { Ruleset } from '../types'

type RulesetCardProps = {
  ruleset: Ruleset
  onEdit: (ruleset: Ruleset) => void
  onDelete: (id: number) => void
}

export function RulesetCard({ ruleset, onEdit, onDelete }: RulesetCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{ruleset.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(ruleset)}
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(ruleset.id)}
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {ruleset.version && <Badge variant="outline">v{ruleset.version}</Badge>}
        {ruleset.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ruleset.description}</p>
        )}
        {ruleset.effectiveDate && (
          <p className="text-xs text-muted-foreground">
            Vigente desde: {new Date(ruleset.effectiveDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
