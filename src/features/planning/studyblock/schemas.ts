import { z } from 'zod'

export const createStudyBlockSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  blockOrder: z.number().int().min(0).default(0),
  notesMarkdown: z.string().max(10000).optional(),
  focusEntities: z.string().max(2000).optional(),
})

export type CreateStudyBlockForm = z.input<typeof createStudyBlockSchema>
