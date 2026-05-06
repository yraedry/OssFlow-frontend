import { apiClient } from '@/shared/api/client'
import type { StudyBlock, CreateStudyBlockRequest } from './types'
import type { Page } from '@/shared/types/pagination'

export const studyBlockApi = {
  list: (planId: number) =>
    apiClient
      .get(`api/v1/study-plans/${planId}/blocks`, { searchParams: { page: 0, size: 50 } })
      .json<Page<StudyBlock>>(),

  create: (planId: number, data: CreateStudyBlockRequest) =>
    apiClient.post(`api/v1/study-plans/${planId}/blocks`, { json: data }).json<StudyBlock>(),

  update: (planId: number, blockId: number, data: Partial<CreateStudyBlockRequest>) =>
    apiClient
      .put(`api/v1/study-plans/${planId}/blocks/${blockId}`, { json: data })
      .json<StudyBlock>(),

  delete: (planId: number, blockId: number) =>
    apiClient.delete(`api/v1/study-plans/${planId}/blocks/${blockId}`),
}
