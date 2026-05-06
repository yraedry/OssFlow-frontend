export type CompetitionLog = {
  id: number
  eventName: string
  eventDate: string // ISO date "2026-01-01"
  location?: string
  weightClass?: string
  modality: 'GI' | 'NOGI' | 'BOTH'
  result?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreateCompetitionLogRequest = {
  eventName: string
  eventDate: string
  location?: string
  weightClass?: string
  modality: 'GI' | 'NOGI' | 'BOTH'
  result?: string
  notes?: string
}
