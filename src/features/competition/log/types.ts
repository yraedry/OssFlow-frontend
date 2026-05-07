export type CompetitionLog = {
  id: number
  eventName: string
  eventDate: string
  weightCategory?: string
  totalMatches?: number
  result?: string
  analysisMarkdown?: string
  matches?: CompetitionMatch[]
  createdAt: string
  updatedAt: string
}

export type CompetitionMatch = {
  id: number
  opponentName: string
  opponentBelt?: string
  result: 'WIN' | 'LOSS' | 'DRAW'
  technique?: string
  notes?: string
  duration?: number
  orderIndex: number
}

export type CreateCompetitionLogRequest = {
  eventName: string
  eventDate: string
  weightCategory?: string
  totalMatches?: number
  result?: string
  analysisMarkdown?: string
}
