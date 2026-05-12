import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProfile, createProfile, updateProfile, deleteAccount } from './api'
import type { CreateProfileRequest, UpdateProfileRequest } from './types'

export const PROFILE_KEY = ['profile'] as const

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: getProfile,
    retry: false,
    staleTime: 60_000,
    networkMode: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
    onError: () => toast.error('Error al eliminar la cuenta'),
  })
}
