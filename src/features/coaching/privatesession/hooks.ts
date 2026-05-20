import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { privateSessionApi } from './api'
import type { PrivateSession, CreatePrivateSessionPayload, UpdatePrivateSessionPayload } from './types'

export const PRIVATE_SESSION_KEYS = {
  byAthlete: (athleteId: number) => ['private-sessions', 'athlete', athleteId] as const,
  all: ['private-sessions', 'all'] as const,
  mine: ['private-sessions', 'mine'] as const,
}

export function usePrivateSessions(athleteId: number) {
  return useQuery({
    queryKey: PRIVATE_SESSION_KEYS.byAthlete(athleteId),
    queryFn: () => privateSessionApi.listByAthlete(athleteId),
    staleTime: 30_000,
  })
}

export function useAllPrivateSessions() {
  return useQuery({
    queryKey: PRIVATE_SESSION_KEYS.all,
    queryFn: () => privateSessionApi.listAll(),
    staleTime: 30_000,
  })
}

export function usePrivateSessionsMine() {
  return useQuery({
    queryKey: PRIVATE_SESSION_KEYS.mine,
    queryFn: () => privateSessionApi.listMine(),
    staleTime: 30_000,
  })
}

export function useCreatePrivateSession(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePrivateSessionPayload) => privateSessionApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRIVATE_SESSION_KEYS.byAthlete(athleteId) })
    },
    onError: () => toast.error('Error al registrar la sesión'),
  })
}

export function useUpdatePrivateSession(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePrivateSessionPayload }) =>
      privateSessionApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: PRIVATE_SESSION_KEYS.byAthlete(athleteId) })
      const prev = qc.getQueryData<PrivateSession[]>(PRIVATE_SESSION_KEYS.byAthlete(athleteId))
      qc.setQueryData<PrivateSession[]>(PRIVATE_SESSION_KEYS.byAthlete(athleteId), old =>
        (old ?? []).map(s => s.id === id ? { ...s, ...payload } : s),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined)
        qc.setQueryData(PRIVATE_SESSION_KEYS.byAthlete(athleteId), context.prev)
      toast.error('Error al actualizar la sesión')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PRIVATE_SESSION_KEYS.byAthlete(athleteId) })
    },
  })
}

export function useDeletePrivateSession(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => privateSessionApi.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: PRIVATE_SESSION_KEYS.byAthlete(athleteId) })
      const prev = qc.getQueryData<PrivateSession[]>(PRIVATE_SESSION_KEYS.byAthlete(athleteId))
      qc.setQueryData<PrivateSession[]>(PRIVATE_SESSION_KEYS.byAthlete(athleteId), old =>
        (old ?? []).filter(s => s.id !== id),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined)
        qc.setQueryData(PRIVATE_SESSION_KEYS.byAthlete(athleteId), context.prev)
      toast.error('Error al borrar la sesión')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PRIVATE_SESSION_KEYS.byAthlete(athleteId) })
    },
  })
}
