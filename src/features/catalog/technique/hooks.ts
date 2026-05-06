import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { techniqueApi } from './api'
import type { CreateTechniqueRequest } from './types'

export const TECHNIQUES_KEY = ['techniques'] as const

export function useTechniques(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...TECHNIQUES_KEY, params],
    queryFn: () => techniqueApi.list(params),
  })
}

export function useCreateTechnique() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTechniqueRequest) => techniqueApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: TECHNIQUES_KEY }); toast.success('Técnica creada') },
    onError: () => toast.error('Error al crear la técnica'),
  })
}

export function useUpdateTechnique() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTechniqueRequest> }) =>
      techniqueApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: TECHNIQUES_KEY }); toast.success('Técnica actualizada') },
    onError: () => toast.error('Error al actualizar'),
  })
}

export function useDeleteTechnique() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => techniqueApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: TECHNIQUES_KEY }); toast.success('Técnica eliminada') },
    onError: () => toast.error('Error al eliminar'),
  })
}
