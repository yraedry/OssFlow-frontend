import { apiClient } from '@/shared/api/client'
import type { ClassPlan, Modality, ClassPlanStatus } from './types'
import type { StudyBlock, StudyItem } from '../studyplan/types'

const BASE = 'coaching/class-plans'

export const classPlanApi = {
  list(gymId: number): Promise<ClassPlan[]> {
    return apiClient.get(BASE, { searchParams: { gymId } }).json<ClassPlan[]>()
  },
  get(id: number): Promise<ClassPlan> {
    return apiClient.get(`${BASE}/${id}`).json<ClassPlan>()
  },
  create(data: {
    gymId: number
    title: string
    description?: string
    scheduledDate?: string
    durationMinutes?: number
    modality?: Modality
  }): Promise<ClassPlan> {
    return apiClient.post(BASE, { json: data }).json<ClassPlan>()
  },
  update(id: number, data: {
    title: string
    description?: string
    scheduledDate?: string
    durationMinutes?: number
    modality?: Modality
    status?: ClassPlanStatus
  }): Promise<ClassPlan> {
    return apiClient.put(`${BASE}/${id}`, { json: data }).json<ClassPlan>()
  },
  delete(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`).then(() => undefined)
  },
  // Bloques e ítems
  addBlock(planId: number, title?: string): Promise<StudyBlock> {
    return apiClient.post(`${BASE}/${planId}/blocks`,
      { json: { title: title ?? '' } }).json<StudyBlock>()
  },
  updateBlock(planId: number, blockId: number, title: string): Promise<void> {
    return apiClient.patch(`${BASE}/${planId}/blocks/${blockId}`,
      { json: { title } }).text().then(() => {})
  },
  deleteBlock(planId: number, blockId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}/blocks/${blockId}`).then(() => undefined)
  },
  reorderBlocks(planId: number, orderedIds: number[]): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/blocks/reorder`,
      { json: { orderedIds } }).then(() => undefined)
  },
  addTextItem(planId: number, blockId: number, content: string): Promise<StudyItem> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/text`,
      { json: { content } }).json<StudyItem>()
  },
  addTechniqueItem(planId: number, blockId: number, techniqueId: number): Promise<StudyItem> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/technique`,
      { json: { techniqueId } }).json<StudyItem>()
  },
  deleteItem(planId: number, blockId: number, itemId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}/blocks/${blockId}/items/${itemId}`)
      .then(() => undefined)
  },
  reorderItems(planId: number, blockId: number, orderedIds: number[]): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/reorder`,
      { json: { orderedIds } }).then(() => undefined)
  },
}
