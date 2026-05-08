import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFederations, updateProfileFederations, createFederation } from './api'
import type { FederationAssignment } from './types'
import type { CreateFederationRequest } from './api'

export const FEDERATIONS_KEY = ['federations'] as const

export function useFederations() {
  return useQuery({
    queryKey: FEDERATIONS_KEY,
    queryFn: getFederations,
  })
}

export function useCreateFederation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFederationRequest) => createFederation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FEDERATIONS_KEY })
      toast.success('Federación creada')
    },
    onError: () => toast.error('Error al crear la federación'),
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
