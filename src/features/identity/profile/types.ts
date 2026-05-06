export type UserProfile = {
  id: number
  ownerId: number
  displayName: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
  version: number
}

export type CreateProfileRequest = {
  displayName: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
}

export type UpdateProfileRequest = {
  displayName: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
}
