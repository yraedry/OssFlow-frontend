import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { physicalSessionApi } from './api'
import type { CreatePhysicalSessionRequest } from './types'

export const PHYSICAL_SESSIONS_KEY = ['physical-sessions'] as const

export function usePhysicalSessions(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...PHYSICAL_SESSIONS_KEY, params],
    queryFn: () => physicalSessionApi.list(params),
  })
}

export function useCreatePhysicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePhysicalSessionRequest) => physicalSessionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PHYSICAL_SESSIONS_KEY })
      qc.invalidateQueries({ queryKey: ['weekly-stats'] })
      toast.success('Sesión física creada')
    },
    onError: () => toast.error('Error al crear la sesión'),
  })
}

export function useUpdatePhysicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreatePhysicalSessionRequest }) =>
      physicalSessionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PHYSICAL_SESSIONS_KEY })
      toast.success('Sesión actualizada')
    },
    onError: () => toast.error('Error al actualizar la sesión'),
  })
}

export function useDeletePhysicalSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => physicalSessionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PHYSICAL_SESSIONS_KEY })
      qc.invalidateQueries({ queryKey: ['weekly-stats'] })
      toast.success('Sesión eliminada')
    },
    onError: () => toast.error('Error al eliminar'),
  })
}
