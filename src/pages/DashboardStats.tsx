import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'

type PageMeta = { totalElements: number }

type StatCardProps = {
  label: string
  to: string
  queryKey: string[]
  fetcher: () => Promise<PageMeta>
}

function StatCard({ label, to, queryKey, fetcher }: StatCardProps) {
  const { data, isLoading } = useQuery({ queryKey, queryFn: fetcher })
  return (
    <Card className="hover:bg-accent/30 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner className="h-6 w-6" />
        ) : (
          <Link to={to} className="text-3xl font-bold hover:underline">
            {data?.totalElements ?? 0}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

const fetchPageMeta =
  (url: string): (() => Promise<PageMeta>) =>
  () =>
    apiClient.get(url, { searchParams: { page: 0, size: 1 } }).json<PageMeta>()

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Posiciones"
        to="/estudio/posiciones"
        queryKey={['dashboard-stat-positions']}
        fetcher={fetchPageMeta('catalog/positions')}
      />
      <StatCard
        label="Técnicas"
        to="/estudio/tecnicas"
        queryKey={['dashboard-stat-techniques']}
        fetcher={fetchPageMeta('catalog/techniques')}
      />
      <StatCard
        label="Planes de estudio"
        to="/planificacion/planes"
        queryKey={['dashboard-stat-studyplans']}
        fetcher={fetchPageMeta('planning/study-plans')}
      />
      <StatCard
        label="Sesiones"
        to="/diario/sesiones-bjj"
        queryKey={['dashboard-stat-sessions']}
        fetcher={fetchPageMeta('journal/training-sessions')}
      />
    </div>
  )
}
