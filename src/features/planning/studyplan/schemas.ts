import { z } from 'zod'

const optionalDate = z.string().optional().transform(v => (v === '' ? undefined : v))

export const createStudyPlanSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  goalMarkdown: z.string().max(10000).optional().transform(v => (v === '' ? undefined : v)),
  startDate: optionalDate,
  endDate: optionalDate,
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).default('DRAFT'),
})

// Input type: for useForm (status is optional, gets filled by default)
export type CreateStudyPlanForm = z.input<typeof createStudyPlanSchema>
// Output type: after validation/transform (status is always present)
export type CreateStudyPlanFormOutput = z.output<typeof createStudyPlanSchema>
