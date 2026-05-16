export type InvitationCode = {
  code: string
  expiresAt: string
  usedCount: number
}

export type CoachAthleteListItem = {
  athleteId: number
  displayName: string
  currentBelt: string
  linkedAt: string
}

export type CoachListItem = {
  coachId: number
  displayName: string
  academy: string | null
}

export type ActiveInjuryItem = {
  bodyPart: string
  severity: string
}

export type CompetitionItem = {
  name: string
  date: string
  result: string | null
}

export type AthleteSummary = {
  athleteId: number
  displayName: string
  currentBelt: string
  daysInBelt: number
  academy: string | null
  activeInjuries: ActiveInjuryItem[]
  recentCompetitions: CompetitionItem[]
  lastSessionDate: string | null
  daysSinceLastSession: number
}

export type CoachingNotification = {
  id: number
  type: 'ATHLETE_JOINED' | 'ATHLETE_LEFT' | 'COACH_REMOVED_YOU' | 'NOTE_SENT'
  payload: string
  createdAt: string
}

export type TechniqueFamily = {
  value: string
  label: string
}

export type ObservationTone = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

export type Observation = {
  id: number
  athleteId: number
  body: string
  tone: ObservationTone
  techniqueFamily: string | null
  labelledBy: 'KEYWORD' | 'OPENAI' | 'MANUAL' | null
  observedAt: string
}

export type RadarPoint = {
  family: string
  score: number
}

export type CreateObservationPayload = {
  athleteId: number
  body: string
  tone: ObservationTone
  techniqueFamily?: string
}

export type Note = {
  id: number
  coachId: number
  athleteId: number
  body: string
  techniqueFamily: string | null
  deleted: boolean
  read: boolean
  createdAt: string
}

export type CreateNotePayload = {
  athleteId: number
  body: string
  techniqueFamily?: string
}
