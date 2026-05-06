import { apiClient } from '@/shared/api/client'
import type { CompetitionLog, CreateCompetitionLogRequest } from './types'
import type { Page } from '@/shared/types/pagination'

export const competitionLogApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('competition-logs', {
        searchParams: { page: params?.page ?? 0, size: params?.size ?? 20, sort: 'eventDate,desc' },
      })
      .json<Page<CompetitionLog>>(),

  get: (id: number) => apiClient.get(`competition-logs/${id}`).json<CompetitionLog>(),

  create: (data: CreateCompetitionLogRequest) =>
    apiClient.post('competition-logs', { json: data }).json<CompetitionLog>(),

  update: (id: number, data: Partial<CreateCompetitionLogRequest>) =>
    apiClient.put(`competition-logs/${id}`, { json: data }).json<CompetitionLog>(),

  delete: (id: number) => apiClient.delete(`competition-logs/${id}`),
}
