import { apiClient } from '@/shared/api/client'
import type { StudyPlan, StudyBlock, StudyItem } from './types'

const BASE = 'coaching/study-plans'

export const studyPlanApi = {
  create(athleteId: number, title: string): Promise<StudyPlan> {
    return apiClient.post(BASE, { json: { athleteId, title } }).json<StudyPlan>()
  },

  listForCoach(athleteId: number): Promise<StudyPlan[]> {
    return apiClient.get(`${BASE}/athlete/${athleteId}`).json<StudyPlan[]>()
  },

  getForCoach(planId: number): Promise<StudyPlan> {
    return apiClient.get(`${BASE}/${planId}`).json<StudyPlan>()
  },

  updateContent(planId: number, title: string, description?: string): Promise<void> {
    return apiClient.patch(`${BASE}/${planId}/content`, { json: { title, description } }).json<void>()
  },

  publish(planId: number): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/publish`).text().then(() => {})
  },

  unpublish(planId: number): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/unpublish`).text().then(() => {})
  },

  deletePlan(planId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}`).json<void>()
  },

  addBlock(planId: number, title?: string): Promise<StudyBlock> {
    return apiClient.post(`${BASE}/${planId}/blocks`, { json: { title: title ?? '' } }).json<StudyBlock>()
  },

  deleteBlock(planId: number, blockId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}/blocks/${blockId}`).json<void>()
  },

  reorderBlocks(planId: number, orderedIds: number[]): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/blocks/reorder`, { json: { orderedIds } }).json<void>()
  },

  addTextItem(planId: number, blockId: number, content: string): Promise<StudyItem> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/text`, { json: { content } }).json<StudyItem>()
  },

  addTechniqueItem(planId: number, blockId: number, techniqueId: number): Promise<StudyItem> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/technique`, { json: { techniqueId } }).json<StudyItem>()
  },

  deleteItem(planId: number, blockId: number, itemId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}/blocks/${blockId}/items/${itemId}`).json<void>()
  },

  reorderItems(planId: number, blockId: number, orderedIds: number[]): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/reorder`, { json: { orderedIds } }).json<void>()
  },

  listReceived(): Promise<StudyPlan[]> {
    return apiClient.get(`${BASE}/received`).json<StudyPlan[]>()
  },

  getReceived(planId: number): Promise<StudyPlan> {
    return apiClient.get(`${BASE}/received/${planId}`).json<StudyPlan>()
  },
}
