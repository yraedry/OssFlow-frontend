export type CompetitionMatch = {
  id: number
  logId: number
  opponentName: string
  opponentBelt?: string
  result: 'WIN' | 'LOSS' | 'DRAW'
  technique?: string
  notes?: string
  duration?: number // seconds
  orderIndex: number
}

export type CreateCompetitionMatchRequest = {
  opponentName: string
  opponentBelt?: string
  result: 'WIN' | 'LOSS' | 'DRAW'
  technique?: string
  notes?: string
  duration?: number
  orderIndex?: number
}
