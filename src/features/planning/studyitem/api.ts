import { apiClient } from '@/shared/api/client'
import type { StudyItem, CreateStudyItemRequest, TransitionRequest } from './types'
import type { Page } from '@/shared/types/pagination'

export const studyItemApi = {
  list: (planId: number, blockId: number) =>
    apiClient
      .get(`planning/study-plans/${planId}/blocks/${blockId}/items`, {
        searchParams: { page: 0, size: 100 },
      })
      .json<Page<StudyItem>>(),

  create: (planId: number, blockId: number, data: CreateStudyItemRequest) =>
    apiClient
      .post(`planning/study-plans/${planId}/blocks/${blockId}/items`, { json: data })
      .json<StudyItem>(),

  transition: (planId: number, blockId: number, itemId: number, data: TransitionRequest) =>
    apiClient
      .post(`planning/study-plans/${planId}/blocks/${blockId}/items/${itemId}/transition`, {
        json: data,
      })
      .json<StudyItem>(),

  delete: (planId: number, blockId: number, itemId: number) =>
    apiClient.delete(`planning/study-plans/${planId}/blocks/${blockId}/items/${itemId}`),
}
