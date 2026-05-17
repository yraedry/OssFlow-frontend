import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { classPlanApi } from './api'
import type { Modality, ClassPlanStatus } from './types'

const KEYS = {
  plans: (gymId: number) => ['class-plans', gymId] as const,
  plan: (id: number) => ['class-plan', id] as const,
}

export function useClassPlans(gymId: number | undefined) {
  return useQuery({
    queryKey: gymId !== undefined ? KEYS.plans(gymId) : ['class-plans-disabled'],
    queryFn: () => classPlanApi.list(gymId!),
    enabled: gymId !== undefined,
    staleTime: 30_000,
  })
}

export function useClassPlan(id: number) {
  return useQuery({
    queryKey: KEYS.plan(id),
    queryFn: () => classPlanApi.get(id),
    staleTime: 30_000,
  })
}

export function useCreateClassPlan(gymId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string; description?: string; scheduledDate?: string
      durationMinutes?: number; modality?: Modality
    }) => classPlanApi.create({ gymId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plans(gymId) }),
    onError: () => toast.error('Error al crear el plan'),
  })
}

export function useUpdateClassPlan(planId: number, gymId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string; description?: string; scheduledDate?: string
      durationMinutes?: number; modality?: Modality; status?: ClassPlanStatus
    }) => classPlanApi.update(planId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plan(planId) })
      qc.invalidateQueries({ queryKey: KEYS.plans(gymId) })
    },
    onError: () => toast.error('Error al actualizar el plan'),
  })
}

export function useDeleteClassPlan(gymId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => classPlanApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plans(gymId) }),
    onError: () => toast.error('Error al eliminar el plan'),
  })
}

export function useAddClassBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title?: string) => classPlanApi.addBlock(planId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al añadir bloque'),
  })
}

export function useUpdateClassBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, title }: { blockId: number; title: string }) =>
      classPlanApi.updateBlock(planId, blockId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('No se pudo guardar el título del bloque'),
  })
}

export function useDeleteClassBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (blockId: number) => classPlanApi.deleteBlock(planId, blockId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al eliminar bloque'),
  })
}

export function useReorderClassBlocks(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: number[]) => classPlanApi.reorderBlocks(planId, orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
  })
}

export function useAddClassTextItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, content }: { blockId: number; content: string }) =>
      classPlanApi.addTextItem(planId, blockId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al añadir item'),
  })
}

export function useAddClassTechniqueItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, techniqueId }: { blockId: number; techniqueId: number }) =>
      classPlanApi.addTechniqueItem(planId, blockId, techniqueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al añadir técnica'),
  })
}

export function useDeleteClassItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, itemId }: { blockId: number; itemId: number }) =>
      classPlanApi.deleteItem(planId, blockId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al eliminar item'),
  })
}

export function useReorderClassItems(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, orderedIds }: { blockId: number; orderedIds: number[] }) =>
      classPlanApi.reorderItems(planId, blockId, orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
  })
}
