import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFederations, getProfileFederations, updateProfileFederations } from './api'
import type { FederationAssignment } from './types'

export const FEDERATIONS_KEY = ['federations'] as const
export const PROFILE_FEDERATIONS_KEY = (profileId: number) =>
  ['profile-federations', profileId] as const

export function useFederations() {
  return useQuery({
    queryKey: FEDERATIONS_KEY,
    queryFn: getFederations,
  })
}

export function useProfileFederations(profileId: number) {
  return useQuery({
    queryKey: PROFILE_FEDERATIONS_KEY(profileId),
    queryFn: () => getProfileFederations(profileId),
    enabled: profileId > 0,
  })
}

export function useUpdateProfileFederations(profileId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (federations: FederationAssignment[]) =>
      updateProfileFederations(profileId, federations),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_FEDERATIONS_KEY(profileId) })
      toast.success('Federaciones actualizadas')
    },
    onError: () => toast.error('Error al actualizar federaciones'),
  })
}
