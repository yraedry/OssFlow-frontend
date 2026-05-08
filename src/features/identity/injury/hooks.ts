import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getInjuries, createInjury, updateInjury, deleteInjury } from './api'
import type { CreateInjuryRequest } from './types'

export const INJURIES_KEY = ['injuries'] as const

export function useInjuries() {
  return useQuery({
    queryKey: INJURIES_KEY,
    queryFn: getInjuries,
    staleTime: 30_000,
    networkMode: 'always',
  })
}

export function useCreateInjury() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInjuryRequest) => createInjury(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INJURIES_KEY })
      toast.success('Lesión registrada')
    },
    onError: () => toast.error('Error al registrar la lesión'),
  })
}

export function useUpdateInjury() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateInjuryRequest }) =>
      updateInjury(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INJURIES_KEY })
      toast.success('Lesión actualizada')
    },
    onError: () => toast.error('Error al actualizar la lesión'),
  })
}

export function useDeleteInjury() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteInjury(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INJURIES_KEY })
      toast.success('Lesión eliminada')
    },
    onError: () => toast.error('Error al eliminar la lesión'),
  })
}
