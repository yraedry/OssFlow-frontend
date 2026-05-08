import { apiClient } from '@/shared/api/client'
import type { StudyBlock, CreateStudyBlockRequest } from './types'
import type { Page } from '@/shared/types/pagination'

// El backend devuelve List<StudyBlock> (array sin paginar), lo envolvemos en Page
async function listBlocks(planId: number): Promise<Page<StudyBlock>> {
  const blocks = await apiClient
    .get(`planning/study-plans/${planId}/blocks`)
    .json<StudyBlock[]>()
  return { content: blocks, totalElements: blocks.length, totalPages: 1, number: 0, size: blocks.length }
}

export const studyBlockApi = {
  list: (planId: number) => listBlocks(planId),

  create: (planId: number, data: CreateStudyBlockRequest) =>
    apiClient.post(`planning/study-plans/${planId}/blocks`, { json: data }).json<StudyBlock>(),

  update: (planId: number, blockId: number, data: Partial<CreateStudyBlockRequest>) =>
    apiClient
      .put(`planning/study-plans/${planId}/blocks/${blockId}`, { json: data })
      .json<StudyBlock>(),

  delete: (planId: number, blockId: number) =>
    apiClient.delete(`planning/study-plans/${planId}/blocks/${blockId}`),
}
