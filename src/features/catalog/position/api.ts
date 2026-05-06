import { apiClient } from '@/shared/api/client'
import type { Position, CreatePositionRequest } from './types'

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const positionApi = {
  list: (params?: { page?: number; size?: number; type?: string }) =>
    apiClient.get('catalog/positions', { searchParams: params as Record<string, string | number> }).json<PageResponse<Position>>(),
  get: (id: number) => apiClient.get(`catalog/positions/${id}`).json<Position>(),
  create: (data: CreatePositionRequest) =>
    apiClient.post('catalog/positions', { json: data }).json<Position>(),
  update: (id: number, data: Partial<CreatePositionRequest>) =>
    apiClient.patch(`catalog/positions/${id}`, { json: data }).json<Position>(),
  delete: (id: number) => apiClient.delete(`catalog/positions/${id}`),
  restore: (id: number) => apiClient.post(`catalog/positions/${id}/restore`).json<Position>(),
}
