export type UserProfile = {
  id: number
  ownerId: string
  displayName: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export type UpdateProfileRequest = {
  displayName: string
  avatarUrl?: string
  bio?: string
}

export type CreateProfileRequest = {
  displayName: string
  avatarUrl?: string
  bio?: string
}
