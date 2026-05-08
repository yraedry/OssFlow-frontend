import { apiClient } from '@/shared/api/client'
import type { Exercise, CreateExerciseRequest, ExerciseCategory, EquipmentType } from './types'

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

interface ExerciseListParams {
  page?: number
  size?: number
  category?: ExerciseCategory
  equipment?: EquipmentType
  visibility?: 'PUBLIC' | 'PRIVATE'
}

export const exerciseApi = {
  list: (params?: ExerciseListParams) =>
    apiClient
      .get('catalog/exercises', { searchParams: params as Record<string, string | number> })
      .json<PageResponse<Exercise>>(),
  get: (id: number) => apiClient.get(`catalog/exercises/${id}`).json<Exercise>(),
  create: (data: CreateExerciseRequest) =>
    apiClient.post('catalog/exercises', { json: data }).json<Exercise>(),
  update: (id: number, data: Partial<CreateExerciseRequest>) => {
    const body = { ...data }
    if (!body.youtubeUrl) delete body.youtubeUrl
    return apiClient.put(`catalog/exercises/${id}`, { json: body }).json<Exercise>()
  },
  delete: (id: number) => apiClient.delete(`catalog/exercises/${id}`),
}
