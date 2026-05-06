import { z } from 'zod'

export const createRulesetSchema = z.object({
  federationId: z.number().int().min(1, 'Federación requerida'),
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(2000).optional(),
  version: z.string().max(50).optional(),
  effectiveDate: z.string().optional(),
})

export type CreateRulesetForm = z.infer<typeof createRulesetSchema>
