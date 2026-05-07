import { z } from 'zod'

const DAY_OF_WEEK = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
])

export const dayEntrySchema = z.object({
  dayOfWeek: DAY_OF_WEEK,
  bjj: z.boolean(),
  strength: z.boolean(),
  cardio: z.boolean(),
})

export const saveWeeklyTemplateSchema = z.object({
  days: z.array(dayEntrySchema).max(7),
})

export type SaveWeeklyTemplateForm = z.infer<typeof saveWeeklyTemplateSchema>
