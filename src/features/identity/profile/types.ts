export interface Profile {
  id: number
  username: string
  belt: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK'
  stripes: number
  createdAt: string
  updatedAt: string
}

export interface CreateProfileRequest {
  username: string
  belt: Profile['belt']
  stripes: number
}
