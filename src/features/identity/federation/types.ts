export type Federation = {
  id: number
  code: string
  name: string
  officialUrl?: string
  createdAt: string
  updatedAt: string
}

export type ProfileFederation = {
  federationId: number
  isPrimary: boolean
  federation: Federation
}

export type FederationAssignment = {
  federationId: number
  isPrimary: boolean
}
