import { apiClient } from '@/shared/api/client'
import type { CompetitionMatch, CreateCompetitionMatchRequest } from './types'

export const competitionMatchApi = {
  list: (logId: number) =>
    apiClient.get(`api/v1/competition-logs/${logId}/matches`).json<CompetitionMatch[]>(),

  create: (logId: number, data: CreateCompetitionMatchRequest) =>
    apiClient
      .post(`api/v1/competition-logs/${logId}/matches`, { json: data })
      .json<CompetitionMatch>(),

  update: (logId: number, matchId: number, data: Partial<CreateCompetitionMatchRequest>) =>
    apiClient
      .put(`api/v1/competition-logs/${logId}/matches/${matchId}`, { json: data })
      .json<CompetitionMatch>(),

  delete: (logId: number, matchId: number) =>
    apiClient.delete(`api/v1/competition-logs/${logId}/matches/${matchId}`),
}
