import { apiClient } from '@/shared/api/client'
import type { PhysicalSession, CreatePhysicalSessionRequest } from './types'

interface PageResponse<T> { content: T[]; totalElements: number }

export const physicalSessionApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('journal/physical-sessions', { searchParams: params as Record<string, string | number> })
      .json<PageResponse<PhysicalSession>>(),
  get: (id: number) =>
    apiClient.get(`journal/physical-sessions/${id}`).json<PhysicalSession>(),
  create: (data: CreatePhysicalSessionRequest) =>
    apiClient.post('journal/physical-sessions', { json: data }).json<PhysicalSession>(),
  update: (id: number, data: CreatePhysicalSessionRequest) =>
    apiClient.put(`journal/physical-sessions/${id}`, { json: data }).json<PhysicalSession>(),
  delete: (id: number) =>
    apiClient.delete(`journal/physical-sessions/${id}`),
}
