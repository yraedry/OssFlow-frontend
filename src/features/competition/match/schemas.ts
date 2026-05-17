import { z } from 'zod'

export const createMatchSchema = z.object({
  matchOrder:    z.number().int().min(0).optional(),
  opponentName:  z.string().max(200).optional(),
  opponentTeam:  z.string().max(200).optional(),
  outcome:       z.string().max(20).optional(),
  method:        z.string().max(50).optional(),
  round:         z.string().max(50).optional(),
  techniqueText: z.string().max(255).optional(),
  notesMarkdown: z.string().max(5000).optional(),
})

export type CreateMatchForm = z.infer<typeof createMatchSchema>
