import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { StudyPlan } from '../types'

type StudyPlanCardProps = {
  plan: StudyPlan
  onClick: (plan: StudyPlan) => void
  onDelete: (id: number) => void
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: es })
}

export function StudyPlanCard({ plan, onClick, onDelete }: StudyPlanCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(plan)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{plan.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(plan.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(plan.startDate)}</span>
          {plan.endDate && <span>→ {formatDate(plan.endDate)}</span>}
        </div>
        {plan.goalMarkdown && (
          <p className="text-sm text-muted-foreground line-clamp-2">{plan.goalMarkdown}</p>
        )}
      </CardContent>
    </Card>
  )
}
