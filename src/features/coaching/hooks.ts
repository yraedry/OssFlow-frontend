import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { coachingApi } from './api'
import type { Observation, RadarPoint, CreateObservationPayload, UpdateObservationPayload, Note, CreateNotePayload, CreateRecommendationPayload } from './types'
import { techniqueApi } from '@/features/catalog/technique/api'
import { ApiClientError } from '@/shared/api/client'

export const COACHING_KEYS = {
  invitation: ['coaching', 'invitation'] as const,
  athletes: ['coaching', 'athletes'] as const,
  athlete: (id: number) => ['coaching', 'athletes', id] as const,
  coaches: ['coaching', 'coaches'] as const,
  notifications: ['coaching', 'notifications'] as const,
  observations: (athleteId: number) => ['coaching', 'observations', athleteId] as const,
  observationRadar: (athleteId: number) => ['coaching', 'observation-radar', athleteId] as const,
  techniqueFamilies: ['coaching', 'technique-families'] as const,
  notes: (athleteId: number) => ['coaching', 'notes', athleteId] as const,
  receivedNotes: ['coaching', 'received-notes'] as const,
  noteDetail: (id: number) => ['coaching', 'note-detail', id] as const,
  noteUnreadCount: ['coaching', 'note-unread-count'] as const,
  recommendationsSent: (athleteId: number) => ['coaching', 'recommendations-sent', athleteId] as const,
  recommendationsReceived: () => ['coaching', 'recommendations-received'] as const,
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
    onMutate: () => {
      qc.setQueryData(COACHING_KEYS.invitation, null)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.invitation })
      toast.success('Invitación revocada')
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.invitation })
      toast.error('Error al revocar la invitación')
    },
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

export function useTechniqueFamilies() {
  return useQuery({
    queryKey: COACHING_KEYS.techniqueFamilies,
    queryFn: () => coachingApi.getTechniqueFamilies(),
    staleTime: Infinity,
  })
}

export function useObservations(athleteId: number) {
  return useQuery({
    queryKey: COACHING_KEYS.observations(athleteId),
    queryFn: () => coachingApi.getObservations(athleteId),
    staleTime: 30_000,
  })
}

export function useObservationRadar(athleteId: number) {
  return useQuery({
    queryKey: COACHING_KEYS.observationRadar(athleteId),
    queryFn: () => coachingApi.getObservationRadar(athleteId),
    staleTime: 30_000,
  })
}

export function useCreateObservation(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateObservationPayload) => coachingApi.createObservation(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: COACHING_KEYS.observations(athleteId) })
      await qc.cancelQueries({ queryKey: COACHING_KEYS.observationRadar(athleteId) })

      const prevObs = qc.getQueryData<Observation[]>(COACHING_KEYS.observations(athleteId))
      const prevRadar = qc.getQueryData<RadarPoint[]>(COACHING_KEYS.observationRadar(athleteId))

      const tempId = -Date.now()
      const tempObs: Observation = {
        id: tempId,
        athleteId,
        body: payload.body,
        tone: payload.tone,
        techniqueFamily: payload.techniqueFamily ?? null,
        labelledBy: payload.techniqueFamily ? 'MANUAL' : null,
        observedAt: new Date().toISOString(),
      }
      qc.setQueryData<Observation[]>(COACHING_KEYS.observations(athleteId), old => [tempObs, ...(old ?? [])])

      if (payload.techniqueFamily) {
        const delta = payload.tone === 'POSITIVE' ? 1 : payload.tone === 'NEGATIVE' ? -1 : 0
        if (delta !== 0) {
          qc.setQueryData<RadarPoint[]>(COACHING_KEYS.observationRadar(athleteId), old => {
            const existing = old ?? []
            const idx = existing.findIndex(p => p.family === payload.techniqueFamily)
            if (idx >= 0) {
              const updated = [...existing]
              updated[idx] = { ...updated[idx], score: updated[idx].score + delta }
              return updated
            }
            return [...existing, { family: payload.techniqueFamily!, score: delta }]
          })
        }
      }

      return { prevObs, prevRadar, tempId }
    },
    onSuccess: (created, _, context) => {
      qc.setQueryData<Observation[]>(COACHING_KEYS.observations(athleteId), old =>
        (old ?? []).map(o => o.id === context?.tempId ? created : o),
      )
    },
    onError: (_err, _vars, context) => {
      if (context?.prevObs !== undefined)
        qc.setQueryData(COACHING_KEYS.observations(athleteId), context.prevObs)
      if (context?.prevRadar !== undefined)
        qc.setQueryData(COACHING_KEYS.observationRadar(athleteId), context.prevRadar)
      toast.error('Error al guardar la observación')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.observations(athleteId) })
      qc.invalidateQueries({ queryKey: COACHING_KEYS.observationRadar(athleteId) })
    },
  })
}

export function useUpdateObservation(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateObservationPayload }) =>
      coachingApi.updateObservation(id, payload),
    onMutate: async ({ id, payload }) => {
      await qc.cancelQueries({ queryKey: COACHING_KEYS.observations(athleteId) })
      const prev = qc.getQueryData<Observation[]>(COACHING_KEYS.observations(athleteId))
      qc.setQueryData<Observation[]>(COACHING_KEYS.observations(athleteId), old =>
        (old ?? []).map(o => o.id === id ? { ...o, ...payload, techniqueFamily: payload.techniqueFamily ?? null } : o),
      )
      return { prev }
    },
    onSuccess: (updated, { id }) => {
      qc.setQueryData<Observation[]>(COACHING_KEYS.observations(athleteId), old =>
        (old ?? []).map(o => o.id === id ? updated : o),
      )
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined)
        qc.setQueryData(COACHING_KEYS.observations(athleteId), context.prev)
      toast.error('Error al actualizar la observación')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.observations(athleteId) })
      qc.invalidateQueries({ queryKey: COACHING_KEYS.observationRadar(athleteId) })
    },
  })
}

export function useDeleteObservation(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coachingApi.deleteObservation(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: COACHING_KEYS.observations(athleteId) })
      await qc.cancelQueries({ queryKey: COACHING_KEYS.observationRadar(athleteId) })

      const prevObs = qc.getQueryData<Observation[]>(COACHING_KEYS.observations(athleteId))
      const prevRadar = qc.getQueryData<RadarPoint[]>(COACHING_KEYS.observationRadar(athleteId))

      const toDelete = prevObs?.find(o => o.id === id)
      qc.setQueryData<Observation[]>(COACHING_KEYS.observations(athleteId), old =>
        (old ?? []).filter(o => o.id !== id),
      )

      if (toDelete?.techniqueFamily) {
        const delta = toDelete.tone === 'POSITIVE' ? -1 : toDelete.tone === 'NEGATIVE' ? 1 : 0
        if (delta !== 0) {
          qc.setQueryData<RadarPoint[]>(COACHING_KEYS.observationRadar(athleteId), old =>
            (old ?? [])
              .map(p => p.family === toDelete.techniqueFamily ? { ...p, score: p.score + delta } : p)
              .filter(p => p.score !== 0),
          )
        }
      }

      return { prevObs, prevRadar }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevObs !== undefined)
        qc.setQueryData(COACHING_KEYS.observations(athleteId), context.prevObs)
      if (context?.prevRadar !== undefined)
        qc.setQueryData(COACHING_KEYS.observationRadar(athleteId), context.prevRadar)
      toast.error('Error al borrar la observación')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.observations(athleteId) })
      qc.invalidateQueries({ queryKey: COACHING_KEYS.observationRadar(athleteId) })
    },
  })
}

export function useCoachNotes(athleteId: number) {
  return useQuery({
    queryKey: COACHING_KEYS.notes(athleteId),
    queryFn: () => coachingApi.getNotesByAthlete(athleteId),
    staleTime: 30_000,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => coachingApi.createNote(payload),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.notes(payload.athleteId) })
    },
    onError: () => toast.error('Error al enviar la nota'),
  })
}

export function useDeleteNote(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coachingApi.deleteNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.notes(athleteId) })
    },
    onError: () => toast.error('Error al borrar la nota'),
  })
}

export function useReceivedNotes() {
  return useQuery({
    queryKey: COACHING_KEYS.receivedNotes,
    queryFn: () => coachingApi.getReceivedNotes(),
    staleTime: 30_000,
  })
}

export function useNoteDetail(id: number) {
  return useQuery({
    queryKey: COACHING_KEYS.noteDetail(id),
    queryFn: () => coachingApi.getNoteDetail(id),
    staleTime: Infinity, // inmutable después de leer
  })
}

export function useMarkNoteRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coachingApi.markNoteRead(id),
    onSuccess: (_, id) => {
      // Actualiza el detalle en cache: read = true
      qc.setQueryData<Note>(COACHING_KEYS.noteDetail(id), old =>
        old ? { ...old, read: true } : old
      )
      // Invalida el count y la lista
      qc.invalidateQueries({ queryKey: COACHING_KEYS.noteUnreadCount })
      qc.invalidateQueries({ queryKey: COACHING_KEYS.receivedNotes })
    },
    onError: () => toast.error('Error al marcar la nota como leída'),
  })
}

export function useNoteUnreadCount() {
  return useQuery({
    queryKey: COACHING_KEYS.noteUnreadCount,
    queryFn: () => coachingApi.getNoteUnreadCount(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

// Recommendations

export function useRecommendationsSent(athleteId: number) {
  return useQuery({
    queryKey: COACHING_KEYS.recommendationsSent(athleteId),
    queryFn: () => coachingApi.getRecommendationsSent(athleteId),
    enabled: !!athleteId,
    staleTime: 30_000,
  })
}

export function useRecommendationsReceived() {
  return useQuery({
    queryKey: COACHING_KEYS.recommendationsReceived(),
    queryFn: () => coachingApi.getRecommendationsReceived(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useCreateRecommendation(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRecommendationPayload) => coachingApi.createRecommendation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.recommendationsSent(athleteId) })
    },
    onError: () => toast.error('Error al enviar la recomendación'),
  })
}

export function useCancelRecommendation(athleteId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coachingApi.cancelRecommendation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.recommendationsSent(athleteId) })
    },
    onError: () => toast.error('Error al cancelar la recomendación'),
  })
}

export function useAcceptRecommendation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coachingApi.acceptRecommendation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.recommendationsReceived() })
    },
    onError: () => toast.error('Error al aceptar la recomendación'),
  })
}

export function useDismissRecommendation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coachingApi.dismissRecommendation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COACHING_KEYS.recommendationsReceived() })
    },
    onError: () => toast.error('Error al descartar la recomendación'),
  })
}

export function useTechniqueSearch(query: string) {
  return useQuery({
    queryKey: ['technique-search', query],
    queryFn: () => techniqueApi.list({ search: query, size: 10 }),
    enabled: query.length >= 2,
    staleTime: 30_000,
    select: (data) => data.content.map(t => ({ id: t.id, name: t.name, family: t.category })),
  })
}
