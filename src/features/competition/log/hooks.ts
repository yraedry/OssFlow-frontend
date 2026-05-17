import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { competitionLogApi } from './api'
import type { CreateCompetitionLogRequest } from './types'

export const COMPETITION_LOGS_KEY = ['competition-logs'] as const

export function useCompetitionLogs(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: [...COMPETITION_LOGS_KEY, params],
    queryFn: () => competitionLogApi.list(params),
  })
}

export function useCompetitionLog(id: number) {
  return useQuery({
    queryKey: [...COMPETITION_LOGS_KEY, id],
    queryFn: () => competitionLogApi.get(id),
    enabled: id > 0,
  })
}

export function useCreateCompetitionLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompetitionLogRequest) => competitionLogApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMPETITION_LOGS_KEY })
      toast.success('Competencia creada')
    },
    onError: () => toast.error('Error al crear la competencia'),
  })
}

export function useUpdateCompetitionLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCompetitionLogRequest> }) =>
      competitionLogApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMPETITION_LOGS_KEY })
      toast.success('Competencia actualizada')
    },
    onError: () => toast.error('Error al actualizar la competencia'),
  })
}

export function useAthleteCompetitionLogs(athleteId: number, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['coach-athlete-competition-logs', athleteId, params],
    queryFn: () => competitionLogApi.listForAthlete(athleteId, params),
    enabled: athleteId > 0,
  })
}

export function useDeleteCompetitionLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => competitionLogApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMPETITION_LOGS_KEY })
      toast.success('Competencia eliminada')
    },
    onError: () => toast.error('Error al eliminar la competencia'),
  })
}
