export const CATEGORY_AGE_OPTIONS = [
  { value: 'JUVENILE', label: 'Juvenil' },
  { value: 'ADULT',    label: 'Adulto' },
  { value: 'MASTER_1', label: 'Master 1' },
  { value: 'MASTER_2', label: 'Master 2' },
  { value: 'MASTER_3', label: 'Master 3' },
  { value: 'MASTER_4', label: 'Master 4' },
] as const

export const GI_NOGI_OPTIONS = [
  { value: 'GI',   label: 'Gi' },
  { value: 'NOGI', label: 'No-Gi' },
  { value: 'BOTH', label: 'Ambos' },
] as const

export type CompetitionLog = {
  id: number
  eventName: string
  eventDate: string
  weightCategory?: string
  categoryAge?: string
  location?: string
  giNogi?: string
  totalMatches?: number
  result?: string
  analysisMarkdown?: string
  matches?: CompetitionMatch[]
  createdAt: string
  updatedAt: string
}

export type CompetitionMatch = {
  id: number
  competitionLogId?: number
  matchOrder?: number
  opponentName?: string
  opponentTeam?: string
  outcome?: string
  method?: string
  submissionTechniqueId?: number
  round?: string
  techniqueText?: string
  notesMarkdown?: string
}

export type CreateCompetitionLogRequest = {
  eventName: string
  eventDate: string
  weightCategory?: string
  categoryAge?: string
  location?: string
  giNogi?: string
  totalMatches?: number
  result?: string
  analysisMarkdown?: string
}
