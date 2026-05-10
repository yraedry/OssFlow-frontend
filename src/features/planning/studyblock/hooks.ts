import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studyBlockApi } from './api'
import type { CreateStudyBlockRequest } from './types'

export const studyBlocksKey = (planId: number) => ['study-plans', planId, 'blocks'] as const

export function useStudyBlocks(planId: number) {
  return useQuery({
    queryKey: studyBlocksKey(planId),
    queryFn: () => studyBlockApi.list(planId),
    enabled: planId > 0,
  })
}

export function useCreateStudyBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStudyBlockRequest) => studyBlockApi.create(planId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyBlocksKey(planId) })
      toast.success('Bloque creado')
    },
    onError: () => toast.error('Error al crear el bloque'),
  })
}

export function useUpdateStudyBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, data }: { blockId: number; data: Partial<CreateStudyBlockRequest> }) =>
      studyBlockApi.update(planId, blockId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyBlocksKey(planId) })
      toast.success('Bloque actualizado')
    },
    onError: () => toast.error('Error al actualizar el bloque'),
  })
}

export function useDeleteStudyBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (blockId: number) => studyBlockApi.delete(planId, blockId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyBlocksKey(planId) })
      toast.success('Bloque eliminado')
    },
    onError: () => toast.error('Error al eliminar el bloque'),
  })
}
