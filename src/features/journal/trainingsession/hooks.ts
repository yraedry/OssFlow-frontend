import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { trainingSessionApi } from './api'
import type { CreateTrainingSessionRequest } from './types'

export const SESSIONS_KEY = ['training-sessions'] as const

export function useTrainingSessions() {
  return useQuery({ queryKey: SESSIONS_KEY, queryFn: () => trainingSessionApi.list() })
}

export function useCreateTrainingSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrainingSessionRequest) => trainingSessionApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: SESSIONS_KEY }); toast.success('Sesión creada') },
    onError: () => toast.error('Error al crear la sesión'),
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
