import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studyPlanApi } from './api'

const KEYS = {
  plans: (athleteId: number) => ['study-plans', athleteId] as const,
  plan: (planId: number) => ['study-plan', planId] as const,
  received: ['study-plans-received'] as const,
}

export function useCoachStudyPlans(athleteId: number) {
  return useQuery({
    queryKey: KEYS.plans(athleteId),
    queryFn: () => studyPlanApi.listForCoach(athleteId),
    staleTime: 30_000,
  })
}

export function useCoachStudyPlan(planId: number) {
  return useQuery({
    queryKey: KEYS.plan(planId),
    queryFn: () => studyPlanApi.getForCoach(planId),
    staleTime: 30_000,
  })
}

export function useCreateStudyPlan(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => studyPlanApi.create(athleteId, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plans(athleteId) })
    },
    onError: () => toast.error('Error al crear el plan'),
  })
}

export function useUpdatePlanContent(planId: number, athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      studyPlanApi.updateContent(planId, title, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plan(planId) })
      qc.invalidateQueries({ queryKey: KEYS.plans(athleteId) })
    },
    onError: () => toast.error('Error al guardar el plan'),
  })
}

export function usePublishPlan(planId: number, athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => studyPlanApi.publish(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plan(planId) })
      qc.invalidateQueries({ queryKey: KEYS.plans(athleteId) })
      toast.success('Plan publicado')
    },
    onError: () => toast.error('Error al publicar el plan'),
  })
}

export function useUnpublishPlan(planId: number, athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => studyPlanApi.unpublish(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plan(planId) })
      qc.invalidateQueries({ queryKey: KEYS.plans(athleteId) })
      toast.success('Plan despublicado')
    },
    onError: () => toast.error('Error al despublicar el plan'),
  })
}

export function useDeleteStudyPlan(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: number) => studyPlanApi.deletePlan(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plans(athleteId) })
    },
    onError: () => toast.error('Error al eliminar el plan'),
  })
}

export function useAddBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title?: string) => studyPlanApi.addBlock(planId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al añadir bloque'),
  })
}

export function useUpdateBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, title }: { blockId: number; title: string }) =>
      studyPlanApi.updateBlock(planId, blockId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('No se pudo guardar el título del bloque'),
  })
}

export function useDeleteBlock(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (blockId: number) => studyPlanApi.deleteBlock(planId, blockId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al eliminar bloque'),
  })
}

export function useReorderBlocks(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: number[]) => studyPlanApi.reorderBlocks(planId, orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
  })
}

export function useAddTextItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, content }: { blockId: number; content: string }) =>
      studyPlanApi.addTextItem(planId, blockId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al añadir item'),
  })
}

export function useAddTechniqueItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, techniqueId }: { blockId: number; techniqueId: number }) =>
      studyPlanApi.addTechniqueItem(planId, blockId, techniqueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al añadir técnica'),
  })
}

export function useDeleteItem(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, itemId }: { blockId: number; itemId: number }) =>
      studyPlanApi.deleteItem(planId, blockId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
    onError: () => toast.error('Error al eliminar item'),
  })
}

export function useReorderItems(planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ blockId, orderedIds }: { blockId: number; orderedIds: number[] }) =>
      studyPlanApi.reorderItems(planId, blockId, orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.plan(planId) }),
  })
}

export function useReceivedStudyPlans() {
  return useQuery({
    queryKey: KEYS.received,
    queryFn: () => studyPlanApi.listReceived(),
    staleTime: 60_000,
  })
}

export function useDuplicatePlan(currentAthleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, targetAthleteId }: { planId: number; targetAthleteId: number }) =>
      studyPlanApi.duplicatePlan(planId, targetAthleteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plans(currentAthleteId) })
      toast.success('Plan duplicado')
    },
    onError: () => toast.error('No se pudo duplicar el plan'),
  })
}
