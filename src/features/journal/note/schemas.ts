import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(300),
  bodyMarkdown: z.string().min(1, 'El contenido es requerido'),
  tags: z.array(z.string()).default([]),
})

export type CreateNoteForm = z.infer<typeof createNoteSchema>
