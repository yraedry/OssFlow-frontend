import { apiClient } from '@/shared/api/client'
import type { StudyPlan, CreateStudyPlanRequest } from './types'
import type { Page } from '@/shared/types/pagination'

export const studyPlanApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('planning/study-plans', {
        searchParams: { page: params?.page ?? 0, size: params?.size ?? 20, sort: 'startDate,desc' },
      })
      .json<Page<StudyPlan>>(),

  get: (id: number) => apiClient.get(`planning/study-plans/${id}`).json<StudyPlan>(),

  create: (data: CreateStudyPlanRequest) =>
    apiClient.post('planning/study-plans', { json: data }).json<StudyPlan>(),

  update: (id: number, data: Partial<CreateStudyPlanRequest>) =>
    apiClient.put(`planning/study-plans/${id}`, { json: data }).json<StudyPlan>(),

  delete: (id: number) => apiClient.delete(`planning/study-plans/${id}`),
}
