import { apiClient } from '@/shared/api/client'
import type { Page } from '@/shared/types/pagination'
import type { System, CreateSystemRequest, UpdateSystemRequest } from './types'

export const systemApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('catalog/systems', { searchParams: params as Record<string, string | number> })
      .json<Page<System>>(),
  get: (id: number) => apiClient.get(`catalog/systems/${id}`).json<System>(),
  create: (data: CreateSystemRequest) =>
    apiClient.post('catalog/systems', { json: data }).json<System>(),
  update: (id: number, data: UpdateSystemRequest) =>
    apiClient.put(`catalog/systems/${id}`, { json: data }).json<System>(),
  delete: (id: number) => apiClient.delete(`catalog/systems/${id}`),
  restore: (id: number) => apiClient.patch(`catalog/systems/${id}/restore`).json<System>(),
}
