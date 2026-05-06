import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { systemApi } from './api'
import type { CreateSystemRequest, UpdateSystemRequest } from './types'

export const SYSTEMS_KEY = ['systems'] as const

export function useSystems(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...SYSTEMS_KEY, params],
    queryFn: () => systemApi.list(params),
  })
}

export function useSystem(id: number) {
  return useQuery({
    queryKey: [...SYSTEMS_KEY, id],
    queryFn: () => systemApi.get(id),
    enabled: id > 0,
  })
}

export function useCreateSystem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSystemRequest) => systemApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SYSTEMS_KEY })
      toast.success('Sistema creado')
    },
    onError: () => toast.error('Error al crear el sistema'),
  })
}

export function useUpdateSystem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSystemRequest }) =>
      systemApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SYSTEMS_KEY })
      toast.success('Sistema actualizado')
    },
    onError: () => toast.error('Error al actualizar el sistema'),
  })
}

export function useDeleteSystem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => systemApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SYSTEMS_KEY })
      toast.success('Sistema eliminado')
    },
    onError: () => toast.error('Error al eliminar el sistema'),
  })
}
