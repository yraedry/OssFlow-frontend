export type AccountRole = 'ATHLETE' | 'ATHLETE_COACH'

export type ProfileFederationEntry = {
  federationId: number
  isPrimary: boolean
}

export type UserProfile = {
  id: number
  ownerId: number
  displayName: string
  firstName?: string
  lastName?: string
  alias?: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
  ageCategory?: string | null
  onboardingCompleted: boolean
  federations: ProfileFederationEntry[]
  role: AccountRole
  createdAt: string
  updatedAt: string
  version: number
}

export type CreateProfileRequest = {
  displayName: string
  firstName?: string
  lastName?: string
  alias?: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
}

export type UpdateProfileRequest = {
  displayName: string
  firstName?: string
  lastName?: string
  alias?: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
}
