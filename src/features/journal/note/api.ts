import { apiClient } from '@/shared/api/client'
import type { Note, CreateNoteRequest } from './types'

interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number }

export const noteApi = {
  list: (params?: { page?: number; size?: number; tag?: string }) =>
    apiClient.get('journal/notes', { searchParams: params as Record<string, string | number> }).json<PageResponse<Note>>(),
  get: (id: number) => apiClient.get(`journal/notes/${id}`).json<Note>(),
  create: (data: CreateNoteRequest) => apiClient.post('journal/notes', { json: data }).json<Note>(),
  update: (id: number, data: Partial<CreateNoteRequest>) =>
    apiClient.patch(`journal/notes/${id}`, { json: data }).json<Note>(),
  delete: (id: number) => apiClient.delete(`journal/notes/${id}`),
  listTags: (prefix?: string) =>
    apiClient.get('journal/tags', { searchParams: prefix ? { prefix } : {} }).json<{ id: number; name: string }[]>(),
}
