import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFederations, updateProfileFederations } from './api'
import type { FederationAssignment } from './types'

export const FEDERATIONS_KEY = ['federations'] as const

export function useFederations() {
  return useQuery({
    queryKey: FEDERATIONS_KEY,
    queryFn: getFederations,
  })
}

export function useUpdateProfileFederations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (federations: FederationAssignment[]) => updateProfileFederations(federations),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Federaciones actualizadas')
    },
    onError: () => toast.error('Error al actualizar federaciones'),
  })
}
