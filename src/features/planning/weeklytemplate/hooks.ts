import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { weeklyTemplateApi } from './api'
import type { SaveWeeklyTemplateForm } from './schemas'

export const WEEKLY_TEMPLATE_KEY = ['weekly-template'] as const

export function useWeeklyTemplate() {
  return useQuery({
    queryKey: WEEKLY_TEMPLATE_KEY,
    queryFn: () => weeklyTemplateApi.get(),
  })
}

export function useSaveWeeklyTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SaveWeeklyTemplateForm) => weeklyTemplateApi.save(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WEEKLY_TEMPLATE_KEY })
      toast.success('Plantilla guardada')
    },
    onError: () => toast.error('Error al guardar la plantilla'),
  })
}
