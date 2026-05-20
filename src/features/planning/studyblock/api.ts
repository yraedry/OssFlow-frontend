import { apiClient } from '@/shared/api/client'
import type { StudyBlock, CreateStudyBlockRequest, StudyItem } from './types'
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
    apiClient.delete(`planning/study-plans/${planId}/blocks/${blockId}`).then(() => undefined),

  listItems: (planId: number, blockId: number) =>
    apiClient.get(`planning/study-plans/${planId}/blocks/${blockId}/items`).json<StudyItem[]>(),

  addTextItem: (planId: number, blockId: number, description: string) =>
    apiClient
      .post(`planning/study-plans/${planId}/blocks/${blockId}/items`, { json: { description, status: 'TODO' } })
      .json<StudyItem>(),

  addTechniqueItem: (planId: number, blockId: number, techniqueId: number, techniqueName: string) =>
    apiClient
      .post(`planning/study-plans/${planId}/blocks/${blockId}/items`, {
        json: { description: techniqueName, targetType: 'TECHNIQUE', targetId: techniqueId, status: 'TODO' },
      })
      .json<StudyItem>(),

  deleteItem: (planId: number, blockId: number, itemId: number) =>
    apiClient.delete(`planning/study-plans/${planId}/blocks/${blockId}/items/${itemId}`).then(() => undefined),
}
