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
  type: 'ATHLETE_JOINED' | 'ATHLETE_LEFT' | 'COACH_REMOVED_YOU'
  payload: string
  createdAt: string
}
