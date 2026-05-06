import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { positionApi } from './api'
import type { CreatePositionRequest } from './types'

export const POSITIONS_KEY = ['positions'] as const

export function usePositions(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...POSITIONS_KEY, params],
    queryFn: () => positionApi.list(params),
  })
}

export function usePosition(id: number) {
  return useQuery({
    queryKey: [...POSITIONS_KEY, id],
    queryFn: () => positionApi.get(id),
    enabled: id > 0,
  })
}

export function useCreatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePositionRequest) => positionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POSITIONS_KEY })
      toast.success('Posición creada')
    },
    onError: () => toast.error('Error al crear la posición'),
  })
}

export function useUpdatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePositionRequest> }) =>
      positionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POSITIONS_KEY })
      toast.success('Posición actualizada')
    },
    onError: () => toast.error('Error al actualizar la posición'),
  })
}

export function useDeletePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => positionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POSITIONS_KEY })
      toast.success('Posición eliminada')
    },
    onError: () => toast.error('Error al eliminar la posición'),
  })
}
