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
    return apiClient.patch(`${BASE}/${planId}/content`, { json: { title, description } }).then(() => undefined)
  },

  publish(planId: number): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/publish`).then(() => undefined)
  },

  unpublish(planId: number): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/unpublish`).then(() => undefined)
  },

  deletePlan(planId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}`).then(() => undefined)
  },

  addBlock(planId: number, title?: string): Promise<StudyBlock> {
    return apiClient.post(`${BASE}/${planId}/blocks`, { json: { title: title ?? '' } }).json<StudyBlock>()
  },

  updateBlock(planId: number, blockId: number, title: string): Promise<void> {
    return apiClient.patch(`${BASE}/${planId}/blocks/${blockId}`, { json: { title } }).text().then(() => {})
  },

  deleteBlock(planId: number, blockId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}/blocks/${blockId}`).then(() => undefined)
  },

  reorderBlocks(planId: number, orderedIds: number[]): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/blocks/reorder`, { json: { orderedIds } }).then(() => undefined)
  },

  addTextItem(planId: number, blockId: number, content: string): Promise<StudyItem> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/text`, { json: { content } }).json<StudyItem>()
  },

  addTechniqueItem(planId: number, blockId: number, techniqueId: number): Promise<StudyItem> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/technique`, { json: { techniqueId } }).json<StudyItem>()
  },

  deleteItem(planId: number, blockId: number, itemId: number): Promise<void> {
    return apiClient.delete(`${BASE}/${planId}/blocks/${blockId}/items/${itemId}`).then(() => undefined)
  },

  reorderItems(planId: number, blockId: number, orderedIds: number[]): Promise<void> {
    return apiClient.post(`${BASE}/${planId}/blocks/${blockId}/items/reorder`, { json: { orderedIds } }).then(() => undefined)
  },

  listReceived(): Promise<StudyPlan[]> {
    return apiClient.get(`${BASE}/received`).json<StudyPlan[]>()
  },

  getReceived(planId: number): Promise<StudyPlan> {
    return apiClient.get(`${BASE}/received/${planId}`).json<StudyPlan>()
  },

  duplicatePlan(planId: number, targetAthleteId: number): Promise<StudyPlan> {
    return apiClient.post(`${BASE}/${planId}/duplicate`, { json: { targetAthleteId } }).json<StudyPlan>()
  },
}
