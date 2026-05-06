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

const BELT_LABELS: Record<Ruleset['belt'], string> = {
  WHITE: 'Blanco', BLUE: 'Azul', PURPLE: 'Morado', BROWN: 'Marrón', BLACK: 'Negro',
}
const MODALITY_LABELS: Record<Ruleset['modality'], string> = {
  GI: 'Gi', NOGI: 'No-Gi', BOTH: 'Ambas',
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
      <CardContent className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{BELT_LABELS[ruleset.belt]}</Badge>
          <Badge variant="outline">{MODALITY_LABELS[ruleset.modality]}</Badge>
        </div>
        {ruleset.effectiveFrom && (
          <p className="text-xs text-muted-foreground">
            Vigente desde: {new Date(ruleset.effectiveFrom).toLocaleDateString()}
            {ruleset.effectiveTo && ` hasta ${new Date(ruleset.effectiveTo).toLocaleDateString()}`}
          </p>
        )}
        {ruleset.sourceUrl && (
          <a
            href={ruleset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Ver reglamento oficial
          </a>
        )}
      </CardContent>
    </Card>
  )
}
