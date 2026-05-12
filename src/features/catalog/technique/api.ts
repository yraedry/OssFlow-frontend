import { apiClient } from '@/shared/api/client'
import type { Technique, CreateTechniqueRequest } from './types'

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

export const techniqueApi = {
  list: (params?: { page?: number; size?: number; category?: string; search?: string }) =>
    apiClient.get('catalog/techniques', { searchParams: params as Record<string, string | number> }).json<PageResponse<Technique>>(),
  get: (id: number) => apiClient.get(`catalog/techniques/${id}`).json<Technique>(),
  create: (data: CreateTechniqueRequest) =>
    apiClient.post('catalog/techniques', { json: data }).json<Technique>(),
  update: (id: number, data: Partial<CreateTechniqueRequest>) => {
    const body = { ...data }
    if (!body.youtubeUrl) delete body.youtubeUrl
    return apiClient.patch(`catalog/techniques/${id}`, { json: body }).json<Technique>()
  },
  delete: (id: number) => apiClient.delete(`catalog/techniques/${id}`),
}
