import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProfile, createProfile, updateProfile } from './api'
import type { CreateProfileRequest, UpdateProfileRequest } from './types'

export const PROFILE_KEY = ['profile'] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: getProfile,
  })
}

export function useCreateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProfileRequest) => createProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY })
      toast.success('Perfil creado')
    },
    onError: () => toast.error('Error al crear el perfil'),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY })
      toast.success('Perfil actualizado')
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  })
}
