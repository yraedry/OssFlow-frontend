import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { competitionMatchApi } from './api'
import type { CreateCompetitionMatchRequest } from './types'

export const matchesKey = (logId: number) => ['competition-logs', logId, 'matches'] as const

export function useCompetitionMatches(logId: number) {
  return useQuery({
    queryKey: matchesKey(logId),
    queryFn: () => competitionMatchApi.list(logId),
    enabled: logId > 0,
  })
}

export function useCreateCompetitionMatch(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompetitionMatchRequest) => competitionMatchApi.create(logId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: matchesKey(logId) })
      toast.success('Match añadido')
    },
    onError: () => toast.error('Error al añadir el match'),
  })
}

export function useUpdateCompetitionMatch(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      matchId,
      data,
    }: {
      matchId: number
      data: Partial<CreateCompetitionMatchRequest>
    }) => competitionMatchApi.update(logId, matchId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: matchesKey(logId) })
      toast.success('Match actualizado')
    },
    onError: () => toast.error('Error al actualizar el match'),
  })
}

export function useDeleteCompetitionMatch(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (matchId: number) => competitionMatchApi.delete(logId, matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: matchesKey(logId) })
      toast.success('Match eliminado')
    },
    onError: () => toast.error('Error al eliminar el match'),
  })
}
