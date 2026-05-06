import { z } from 'zod'

export const createSystemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(120),
  description: z.string().max(2000).optional(),
  flowDefinition: z.string().min(1, 'La definición de flujo es requerida'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
})

export type CreateSystemForm = z.infer<typeof createSystemSchema>
