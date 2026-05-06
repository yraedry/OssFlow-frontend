import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studyItemApi } from './api'
import type { CreateStudyItemRequest, ItemStatus } from './types'

export const studyItemsKey = (planId: number, blockId: number) =>
  ['study-plans', planId, 'blocks', blockId, 'items'] as const

export function useStudyItems(planId: number, blockId: number) {
  return useQuery({
    queryKey: studyItemsKey(planId, blockId),
    queryFn: () => studyItemApi.list(planId, blockId),
    enabled: planId > 0 && blockId > 0,
  })
}

export function useCreateStudyItem(planId: number, blockId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStudyItemRequest) => studyItemApi.create(planId, blockId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyItemsKey(planId, blockId) })
      toast.success('Ítem creado')
    },
    onError: () => toast.error('Error al crear el ítem'),
  })
}

export function useTransitionStudyItem(planId: number, blockId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, targetStatus }: { itemId: number; targetStatus: ItemStatus }) =>
      studyItemApi.transition(planId, blockId, itemId, { targetStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyItemsKey(planId, blockId) })
    },
    onError: () => toast.error('Error al cambiar estado'),
  })
}

export function useDeleteStudyItem(planId: number, blockId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => studyItemApi.delete(planId, blockId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyItemsKey(planId, blockId) })
      toast.success('Ítem eliminado')
    },
    onError: () => toast.error('Error al eliminar el ítem'),
  })
}
