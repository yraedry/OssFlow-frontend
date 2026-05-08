import { apiClient } from '@/shared/api/client'
import type { TrainingSession, CreateTrainingSessionRequest, WorkedTechnique } from './types'

interface PageResponse<T> { content: T[]; totalElements: number }

export const trainingSessionApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient.get('journal/training-sessions', { searchParams: params as Record<string, string | number> }).json<PageResponse<TrainingSession>>(),
  get: (id: number) => apiClient.get(`journal/training-sessions/${id}`).json<TrainingSession>(),
  create: (data: CreateTrainingSessionRequest) =>
    apiClient.post('journal/training-sessions', { json: data }).json<TrainingSession>(),
  update: (id: number, data: Partial<CreateTrainingSessionRequest>) =>
    apiClient.patch(`journal/training-sessions/${id}`, { json: data }).json<TrainingSession>(),
  delete: (id: number) => apiClient.delete(`journal/training-sessions/${id}`),
  upsertTechnique: (sessionId: number, techniqueId: number, data: { repCount?: number; notesMarkdown?: string }) =>
    apiClient.put(`journal/training-sessions/${sessionId}/techniques/${techniqueId}`, { json: data }).json<WorkedTechnique>(),
  removeTechnique: (sessionId: number, techniqueId: number) =>
    apiClient.delete(`journal/training-sessions/${sessionId}/techniques/${techniqueId}`),
}
