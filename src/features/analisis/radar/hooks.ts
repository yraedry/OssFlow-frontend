import { useQuery } from '@tanstack/react-query'
import { radarApi } from './api'

export function useBjjRadar(days = 90) {
  return useQuery({
    queryKey: ['radar', 'bjj', days],
    queryFn: () => radarApi.bjj(days),
    staleTime: 5 * 60 * 1000,
  })
}
