import { apiClient } from '@/shared/api/client'
import type { CompetitionLog, CreateCompetitionLogRequest } from './types'
import type { Page } from '@/shared/types/pagination'

export const competitionLogApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('api/v1/competition-logs', {
        searchParams: { page: params?.page ?? 0, size: params?.size ?? 20, sort: 'eventDate,desc' },
      })
      .json<Page<CompetitionLog>>(),

  get: (id: number) => apiClient.get(`api/v1/competition-logs/${id}`).json<CompetitionLog>(),

  create: (data: CreateCompetitionLogRequest) =>
    apiClient.post('api/v1/competition-logs', { json: data }).json<CompetitionLog>(),

  update: (id: number, data: Partial<CreateCompetitionLogRequest>) =>
    apiClient.put(`api/v1/competition-logs/${id}`, { json: data }).json<CompetitionLog>(),

  delete: (id: number) => apiClient.delete(`api/v1/competition-logs/${id}`),
}
