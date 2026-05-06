import { apiClient } from '@/shared/api/client'
import type { Technique, CreateTechniqueRequest } from './types'

export const techniqueApi = {
  list: () => apiClient.get('catalog/techniques').json<{ content: Technique[]; totalElements: number }>(),
  get: (id: number) => apiClient.get(`catalog/techniques/${id}`).json<Technique>(),
  create: (data: CreateTechniqueRequest) => apiClient.post('catalog/techniques', { json: data }).json<Technique>(),
  update: (id: number, data: Partial<CreateTechniqueRequest>) =>
    apiClient.patch(`catalog/techniques/${id}`, { json: data }).json<Technique>(),
  delete: (id: number) => apiClient.delete(`catalog/techniques/${id}`),
}
