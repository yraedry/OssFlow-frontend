import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
          <CardTitle className="text-base">
            {ruleset.federationName ?? `Federación #${ruleset.federationId}`}
          </CardTitle>
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
      {ruleset.sourceUrl && (
        <CardContent>
          <a
            href={ruleset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            Ver reglamento oficial
          </a>
        </CardContent>
      )}
    </Card>
  )
}
