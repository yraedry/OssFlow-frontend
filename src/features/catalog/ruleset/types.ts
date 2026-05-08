export type Ruleset = {
  id: number
  federationId: number
  federationName?: string
  sourceUrl?: string
  createdAt: string
  updatedAt: string
}

export type CreateRulesetRequest = {
  federationId: number
  sourceUrl?: string
}

export type UpdateRulesetRequest = Partial<CreateRulesetRequest>
