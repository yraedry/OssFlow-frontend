import { useQuery } from '@tanstack/react-query'
import { fetchWeeklyStats, type WeeklyStats } from '@/shared/api/dashboard'

export function useWeeklyStats() {
  return useQuery<WeeklyStats>({
    queryKey: ['weekly-stats'],
    queryFn: fetchWeeklyStats,
  })
}
