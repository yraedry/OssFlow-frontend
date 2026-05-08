import { z } from 'zod'

export const createRulesetSchema = z.object({
  federationId: z.number().int().min(1, 'Federación requerida'),
  sourceUrl: z.string().url('URL no válida').optional().or(z.literal('')),
})

export type CreateRulesetForm = z.infer<typeof createRulesetSchema>
