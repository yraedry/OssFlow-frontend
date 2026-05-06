import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useStudyPlan } from '../hooks'
import { useStudyBlocks } from '@/features/planning/studyblock/hooks'
import { buildGanttRows } from '../lib/ganttMapper'

export function StudyPlanTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const planId = Number(id)
  const navigate = useNavigate()

  const { data: plan, isLoading: planLoading, error: planError } = useStudyPlan(planId)
  const { data: blocksData, isLoading: blocksLoading } = useStudyBlocks(planId)

  if (planLoading || blocksLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  if (planError || !plan) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar el plan</AlertDescription>
      </Alert>
    )
  }

  const blocks = blocksData?.content ?? []
  const rows = buildGanttRows(plan, blocks)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/planning/study-plans/${planId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{plan.title}</h1>
          <p className="text-muted-foreground text-sm">Timeline del plan</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-36">
        <span>{plan.startDate}</span>
        <span className="flex-1 border-t mx-2" />
        <span>{plan.endDate ?? '(sin fecha fin)'}</span>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay bloques para mostrar en el timeline.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="w-32 text-sm text-right text-muted-foreground truncate">
                {row.title}
              </span>
              <div className="flex-1 relative h-8 bg-muted rounded">
                <div
                  className={`absolute h-full rounded ${row.color} flex items-center px-2`}
                  style={{
                    left: `${row.startPercent}%`,
                    width: `${Math.max(2, row.widthPercent)}%`,
                  }}
                >
                  {row.weekNumber && (
                    <span className="text-xs text-white font-medium">S{row.weekNumber}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
