import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studyPlanApi } from './api'
import type { CreateStudyPlanRequest } from './types'

export const STUDY_PLANS_KEY = ['study-plans'] as const

export function useStudyPlans(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...STUDY_PLANS_KEY, params],
    queryFn: () => studyPlanApi.list(params),
  })
}

export function useStudyPlan(id: number) {
  return useQuery({
    queryKey: [...STUDY_PLANS_KEY, id],
    queryFn: () => studyPlanApi.get(id),
    enabled: id > 0,
  })
}

export function useCreateStudyPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStudyPlanRequest) => studyPlanApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY })
      toast.success('Plan creado')
    },
    onError: () => toast.error('Error al crear el plan'),
  })
}

export function useUpdateStudyPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateStudyPlanRequest> }) =>
      studyPlanApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY })
      toast.success('Plan actualizado')
    },
    onError: () => toast.error('Error al actualizar el plan'),
  })
}

export function useDeleteStudyPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => studyPlanApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDY_PLANS_KEY })
      toast.success('Plan eliminado')
    },
    onError: () => toast.error('Error al eliminar el plan'),
  })
}
