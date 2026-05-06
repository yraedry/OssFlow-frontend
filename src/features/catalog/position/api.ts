import { apiClient } from '@/shared/api/client'
import type { Position, CreatePositionRequest } from './types'

export const positionApi = {
  list: () => apiClient.get('catalog/positions').json<{ content: Position[]; totalElements: number }>(),
  get: (id: number) => apiClient.get(`catalog/positions/${id}`).json<Position>(),
  create: (data: CreatePositionRequest) => apiClient.post('catalog/positions', { json: data }).json<Position>(),
  update: (id: number, data: Partial<CreatePositionRequest>) =>
    apiClient.patch(`catalog/positions/${id}`, { json: data }).json<Position>(),
  delete: (id: number) => apiClient.delete(`catalog/positions/${id}`),
}
