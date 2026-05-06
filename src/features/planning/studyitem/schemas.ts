import { z } from 'zod'

export const createStudyItemSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().int().min(0).default(0),
})

export type CreateStudyItemForm = z.input<typeof createStudyItemSchema>
