export type Federation = {
  id: number
  name: string
  acronym: string
  country: string
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
