import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { rulesetApi } from './api'
import type { CreateRulesetRequest, UpdateRulesetRequest } from './types'

export const RULESETS_KEY = ['rulesets'] as const

export function useRulesets(params?: { page?: number; size?: number; search?: string }) {
  return useQuery({
    queryKey: [...RULESETS_KEY, params],
    queryFn: () => rulesetApi.list(params),
  })
}

export function useCreateRuleset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRulesetRequest) => rulesetApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RULESETS_KEY })
      toast.success('Reglamento creado')
    },
    onError: () => toast.error('Error al crear el reglamento'),
  })
}

export function useUpdateRuleset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRulesetRequest }) =>
      rulesetApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RULESETS_KEY })
      toast.success('Reglamento actualizado')
    },
    onError: () => toast.error('Error al actualizar el reglamento'),
  })
}

export function useDeleteRuleset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rulesetApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RULESETS_KEY })
      toast.success('Reglamento eliminado')
    },
    onError: () => toast.error('Error al eliminar el reglamento'),
  })
}
