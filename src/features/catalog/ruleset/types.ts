export type Ruleset = {
  id: number
  federationId: number
  name: string
  description?: string
  version?: string
  effectiveDate?: string
  createdAt: string
  updatedAt: string
}

export type CreateRulesetRequest = {
  federationId: number
  name: string
  description?: string
  version?: string
  effectiveDate?: string
}

export type UpdateRulesetRequest = Partial<CreateRulesetRequest>
