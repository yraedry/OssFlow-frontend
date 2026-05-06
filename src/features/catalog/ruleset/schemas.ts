import { z } from 'zod'

export const createRulesetSchema = z.object({
  federationId: z.number().int().min(1, 'Federación requerida'),
  belt: z.enum(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']),
  modality: z.enum(['GI', 'NOGI', 'BOTH']),
  effectiveFrom: z.string().min(1, 'La fecha de inicio es requerida'),
  effectiveTo: z.string().optional(),
  sourceUrl: z.string().url('URL no válida').optional().or(z.literal('')),
})

export type CreateRulesetForm = z.infer<typeof createRulesetSchema>
