import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { trainingSessionApi } from './api'
import type { CreateTrainingSessionRequest } from './types'


export const SESSIONS_KEY = ['training-sessions'] as const

export function useTrainingSessions(params?: { page?: number; size?: number }) {
  return useQuery({ queryKey: [...SESSIONS_KEY, params], queryFn: () => trainingSessionApi.list(params) })
}

export function useCreateTrainingSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrainingSessionRequest) => trainingSessionApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SESSIONS_KEY }); toast.success('Sesión creada') },
    onError: () => toast.error('Error al crear la sesión'),
  })
}

export function useUpdateTrainingSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTrainingSessionRequest> }) =>
      trainingSessionApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SESSIONS_KEY }); toast.success('Sesión actualizada') },
    onError: () => toast.error('Error al actualizar la sesión'),
  })
}

export function useDeleteTrainingSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => trainingSessionApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SESSIONS_KEY }); toast.success('Sesión eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })
}

export function useUpsertWorkedTechnique(sessionId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ techniqueId, data }: { techniqueId: number; data: { notesMarkdown?: string } }) =>
      trainingSessionApi.upsertTechnique(sessionId, techniqueId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SESSIONS_KEY }); toast.success('Técnica guardada') },
    onError: () => toast.error('Error al guardar técnica'),
  })
}

export function useRemoveWorkedTechnique(sessionId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (techniqueId: number) => trainingSessionApi.removeTechnique(sessionId, techniqueId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SESSIONS_KEY }); toast.success('Técnica eliminada') },
    onError: () => toast.error('Error al eliminar técnica'),
  })
}
