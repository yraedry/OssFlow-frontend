import { z } from 'zod'

export const createStudyPlanSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  description: z.string().max(10000).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
})

export type CreateStudyPlanForm = z.infer<typeof createStudyPlanSchema>
