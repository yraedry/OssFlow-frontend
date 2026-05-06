import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255),
  content: z.string().min(1, 'El contenido es requerido').max(50000),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
})

export type CreateNoteForm = z.infer<typeof createNoteSchema>
