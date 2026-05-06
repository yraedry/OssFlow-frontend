import { apiClient } from '@/shared/api/client'
import type { StudyPlan, CreateStudyPlanRequest } from './types'
import type { Page } from '@/shared/types/pagination'

export const studyPlanApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('api/v1/study-plans', {
        searchParams: { page: params?.page ?? 0, size: params?.size ?? 20, sort: 'startDate,desc' },
      })
      .json<Page<StudyPlan>>(),

  get: (id: number) => apiClient.get(`api/v1/study-plans/${id}`).json<StudyPlan>(),

  create: (data: CreateStudyPlanRequest) =>
    apiClient.post('api/v1/study-plans', { json: data }).json<StudyPlan>(),

  update: (id: number, data: Partial<CreateStudyPlanRequest>) =>
    apiClient.put(`api/v1/study-plans/${id}`, { json: data }).json<StudyPlan>(),

  delete: (id: number) => apiClient.delete(`api/v1/study-plans/${id}`),
}
