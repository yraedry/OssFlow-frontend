import { apiClient } from '@/shared/api/client'
import type { Note, CreateNoteRequest } from './types'

export const noteApi = {
  list: () => apiClient.get('journal/notes').json<{ content: Note[]; totalElements: number }>(),
  get: (id: number) => apiClient.get(`journal/notes/${id}`).json<Note>(),
  create: (data: CreateNoteRequest) => apiClient.post('journal/notes', { json: data }).json<Note>(),
  update: (id: number, data: Partial<CreateNoteRequest>) =>
    apiClient.patch(`journal/notes/${id}`, { json: data }).json<Note>(),
  delete: (id: number) => apiClient.delete(`journal/notes/${id}`),
}
