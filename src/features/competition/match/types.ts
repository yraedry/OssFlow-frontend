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

export type CreateCompetitionMatchRequest = {
  matchOrder?: number
  opponentName?: string
  opponentTeam?: string
  outcome?: string
  method?: string
  round?: string
  techniqueText?: string
  notesMarkdown?: string
}
