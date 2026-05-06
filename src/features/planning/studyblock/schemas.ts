import { z } from 'zod'

export const createStudyBlockSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(2000).optional(),
  weekNumber: z.number().int().min(1).optional(),
  orderIndex: z.number().int().min(0).default(0),
})

export type CreateStudyBlockForm = z.infer<typeof createStudyBlockSchema>
