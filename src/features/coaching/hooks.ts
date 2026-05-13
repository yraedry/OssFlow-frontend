import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { coachingApi } from './api'
import { ApiClientError } from '@/shared/api/client'

export const COACHING_KEYS = {
  invitation: ['coaching', 'invitation'] as const,
  athletes: ['coaching', 'athletes'] as const,
  athlete: (id: number) => ['coaching', 'athletes', id] as const,
  coaches: ['coaching', 'coaches'] as const,
  notifications: ['coaching', 'notifications'] as const,
}

export function useActiveInvitation() {
  return useQuery({
    queryKey: COACHING_KEYS.invitation,
    queryFn: async () => {
      try {
        return await coachingApi.getActiveInvitation()
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) return null
        throw error
      }
    },
    retry: false,
    staleTime: 30_000,
  })
}

export function useGenerateInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => coachingApi.generateInvitation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.invitation })
    },
    onError: () => toast.error('Error al generar la invitación'),
  })
}

export function useRevokeInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => coachingApi.revokeInvitation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.invitation })
      toast.success('Invitación revocada')
    },
    onError: () => toast.error('Error al revocar la invitación'),
  })
}

export function useAthletes() {
  return useQuery({
    queryKey: COACHING_KEYS.athletes,
    queryFn: () => coachingApi.getAthletes(),
    staleTime: 30_000,
  })
}

export function useAthleteSummary(athleteId: number | null) {
  return useQuery({
    queryKey: COACHING_KEYS.athlete(athleteId!),
    queryFn: () => coachingApi.getAthleteSummary(athleteId!),
    enabled: athleteId !== null,
    staleTime: 60_000,
  })
}

export function useLeaveCoach() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (coachId: number) => coachingApi.leaveCoach(coachId),
    onSuccess: () => qc.invalidateQueries({ queryKey: COACHING_KEYS.coaches }),
    onError: () => toast.error('Error al desvincular. Inténtalo de nuevo.'),
  })
}

export function useCoaches() {
  return useQuery({
    queryKey: COACHING_KEYS.coaches,
    queryFn: () => coachingApi.getCoaches(),
    staleTime: 30_000,
  })
}

export function useRedeemCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => coachingApi.redeemCode(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.coaches })
      toast.success('Vinculado con tu maestro')
    },
    // Error feedback is handled inline in the component via the mutation error state
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: COACHING_KEYS.notifications,
    // La API ya filtra a solo no leídas, length = count de no leídas
    queryFn: () => coachingApi.getNotifications(),
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => coachingApi.markNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.notifications })
    },
  })
}
