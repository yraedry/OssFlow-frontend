import { z } from 'zod'

export const createStudyPlanSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  goalMarkdown: z.string().max(10000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).default('DRAFT'),
})

export type CreateStudyPlanForm = z.output<typeof createStudyPlanSchema>
