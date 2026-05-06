import { z } from 'zod'

export const createStudyPlanSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1, 'Fecha requerida'),
  endDate: z.string().optional(),
})

export type CreateStudyPlanForm = z.infer<typeof createStudyPlanSchema>
