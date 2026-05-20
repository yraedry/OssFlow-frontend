import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { gymApi } from './api'

const KEYS = {
  gyms: ['gyms'] as const,
}

export function useGyms() {
  return useQuery({
    queryKey: KEYS.gyms,
    queryFn: () => gymApi.list(),
    staleTime: 30_000,
  })
}

export function useCreateGym() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, address }: { name: string; address?: string }) =>
      gymApi.create(name, address),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.gyms }),
    onError: () => toast.error('Error al crear el gimnasio'),
  })
}

export function useUpdateGym() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, address }: { id: number; name: string; address?: string }) =>
      gymApi.update(id, name, address),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.gyms }),
    onError: () => toast.error('Error al actualizar el gimnasio'),
  })
}

export function useDeleteGym() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gymApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.gyms }),
    onError: (error: unknown) => {
      const status = (error as { response?: { status: number } })?.response?.status
      if (status === 409) {
        toast.error('No puedes borrar un gimnasio que tiene planes de clase')
      } else {
        toast.error('Error al eliminar el gimnasio')
      }
    },
  })
}
