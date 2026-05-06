import { apiClient } from '@/shared/api/client'
import type { CompetitionMatch, CreateCompetitionMatchRequest } from './types'

export const competitionMatchApi = {
  list: (logId: number) =>
    apiClient.get(`journal/competition-logs/${logId}/matches`).json<CompetitionMatch[]>(),

  create: (logId: number, data: CreateCompetitionMatchRequest) =>
    apiClient
      .post(`journal/competition-logs/${logId}/matches`, { json: data })
      .json<CompetitionMatch>(),

  update: (logId: number, matchId: number, data: Partial<CreateCompetitionMatchRequest>) =>
    apiClient
      .put(`journal/competition-logs/${logId}/matches/${matchId}`, { json: data })
      .json<CompetitionMatch>(),

  delete: (logId: number, matchId: number) =>
    apiClient.delete(`journal/competition-logs/${logId}/matches/${matchId}`),
}
