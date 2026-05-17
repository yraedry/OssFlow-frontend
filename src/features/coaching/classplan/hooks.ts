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
