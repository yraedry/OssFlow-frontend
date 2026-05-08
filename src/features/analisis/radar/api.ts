import { apiClient } from '@/shared/api/client'
import type { RadarDataPoint } from './types'

export const radarApi = {
  bjj: (days = 90) =>
    apiClient.get(`analisis/radar/bjj?days=${days}`).json<RadarDataPoint[]>(),
}
