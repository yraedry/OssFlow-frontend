import { apiClient } from '@/shared/api/client'
import type { PrivateSession, CreatePrivateSessionPayload, UpdatePrivateSessionPayload } from './types'

export const privateSessionApi = {
  listByAthlete(athleteId: number): Promise<PrivateSession[]> {
    return apiClient.get(`coaching/private-sessions?athleteId=${athleteId}`).json<PrivateSession[]>()
  },

  listAll(): Promise<PrivateSession[]> {
    return apiClient.get('coaching/private-sessions').json<PrivateSession[]>()
  },

  listMine(): Promise<PrivateSession[]> {
    return apiClient.get('coaching/private-sessions/mine').json<PrivateSession[]>()
  },

  create(payload: CreatePrivateSessionPayload): Promise<PrivateSession> {
    return apiClient.post('coaching/private-sessions', { json: payload }).json<PrivateSession>()
  },

  update(id: number, payload: UpdatePrivateSessionPayload): Promise<PrivateSession> {
    return apiClient.put(`coaching/private-sessions/${id}`, { json: payload }).json<PrivateSession>()
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`coaching/private-sessions/${id}`).then(() => undefined)
  },
}
