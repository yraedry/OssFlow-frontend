import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { exerciseApi } from './api'
import type { CreateExerciseRequest, ExerciseCategory, EquipmentType } from './types'

export const EXERCISES_KEY = ['exercises'] as const

interface UseExercisesParams {
  page?: number
  size?: number
  category?: ExerciseCategory
  equipment?: EquipmentType
  visibility?: 'PUBLIC' | 'PRIVATE'
}

export function useExercises(params?: UseExercisesParams) {
  return useQuery({
    queryKey: [...EXERCISES_KEY, params],
    queryFn: () => exerciseApi.list(params),
  })
}

export function useExercise(id: number) {
  return useQuery({
    queryKey: [...EXERCISES_KEY, id],
    queryFn: () => exerciseApi.get(id),
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExerciseRequest) => exerciseApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXERCISES_KEY })
      toast.success('Ejercicio creado')
    },
    onError: () => toast.error('Error al crear el ejercicio'),
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateExerciseRequest> }) =>
      exerciseApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXERCISES_KEY })
      toast.success('Ejercicio actualizado')
    },
    onError: () => toast.error('Error al actualizar'),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exerciseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXERCISES_KEY })
      toast.success('Ejercicio eliminado')
    },
    onError: () => toast.error('Error al eliminar'),
  })
}
