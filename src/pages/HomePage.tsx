import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'
import { DashboardStats } from './DashboardStats'
import { useStudyPlans } from '@/features/planning/studyplan/hooks'
import { useCompetitionLogs } from '@/features/competition/log/hooks'

export function HomePage() {
  const { data: plansData, isLoading: plansLoading } = useStudyPlans({ page: 0, size: 5 })
  const { data: competitionData, isLoading: compLoading } = useCompetitionLogs({ page: 0, size: 3 })

  const recentPlans = plansData?.content ?? []
  const recentCompetitions = competitionData?.content ?? []

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>OssFlow</h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          Sistema de conocimiento BJJ
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent plans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Planes recientes
              <Link to="/planning/study-plans" className="text-xs text-primary font-normal hover:underline">
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plansLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : recentPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay planes todavía.</p>
            ) : (
              <ul className="space-y-2">
                {recentPlans.map((plan) => (
                  <li key={plan.id}>
                    <Link
                      to={`/planning/study-plans/${plan.id}`}
                      className="text-sm hover:underline text-foreground"
                    >
                      {plan.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{plan.startDate}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent competitions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Últimas competencias
              <Link to="/competition/logs" className="text-xs text-primary font-normal hover:underline">
                Ver todas
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : recentCompetitions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay competencias registradas.</p>
            ) : (
              <ul className="space-y-2">
                {recentCompetitions.map((comp) => (
                  <li key={comp.id}>
                    <Link
                      to={`/competition/logs/${comp.id}`}
                      className="text-sm hover:underline text-foreground"
                    >
                      {comp.eventName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{comp.eventDate}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
