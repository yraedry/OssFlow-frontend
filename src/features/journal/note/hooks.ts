import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { noteApi } from './api'
import type { CreateNoteRequest } from './types'

export const NOTES_KEY = ['notes'] as const
export const TAGS_KEY = ['tags'] as const

export function useNotes(params?: { page?: number; size?: number }) {
  return useQuery({ queryKey: [...NOTES_KEY, params], queryFn: () => noteApi.list(params) })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNoteRequest) => noteApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTES_KEY }); toast.success('Nota creada') },
    onError: () => toast.error('Error al crear la nota'),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateNoteRequest> }) => noteApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTES_KEY }); toast.success('Nota actualizada') },
    onError: () => toast.error('Error al actualizar'),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => noteApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTES_KEY }); toast.success('Nota eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })
}
