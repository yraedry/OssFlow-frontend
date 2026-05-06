import { apiClient } from '@/shared/api/client'
import type { StudyPlan, CreateStudyPlanRequest } from './types'

export const studyPlanApi = {
  list: () => apiClient.get('planning/study-plans').json<{ content: StudyPlan[]; totalElements: number }>(),
  get: (id: number) => apiClient.get(`planning/study-plans/${id}`).json<StudyPlan>(),
  create: (data: CreateStudyPlanRequest) =>
    apiClient.post('planning/study-plans', { json: data }).json<StudyPlan>(),
  update: (id: number, data: Partial<CreateStudyPlanRequest>) =>
    apiClient.patch(`planning/study-plans/${id}`, { json: data }).json<StudyPlan>(),
  delete: (id: number) => apiClient.delete(`planning/study-plans/${id}`),
}
