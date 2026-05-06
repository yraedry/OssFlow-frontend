import { apiClient } from '@/shared/api/client'
import type { CompetitionMatch, CreateCompetitionMatchRequest } from './types'

export const competitionMatchApi = {
  list: (logId: number) =>
    apiClient.get(`competition-logs/${logId}/matches`).json<CompetitionMatch[]>(),

  create: (logId: number, data: CreateCompetitionMatchRequest) =>
    apiClient
      .post(`competition-logs/${logId}/matches`, { json: data })
      .json<CompetitionMatch>(),

  update: (logId: number, matchId: number, data: Partial<CreateCompetitionMatchRequest>) =>
    apiClient
      .put(`competition-logs/${logId}/matches/${matchId}`, { json: data })
      .json<CompetitionMatch>(),

  delete: (logId: number, matchId: number) =>
    apiClient.delete(`competition-logs/${logId}/matches/${matchId}`),
}
