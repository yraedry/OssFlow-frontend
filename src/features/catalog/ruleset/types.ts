export type Ruleset = {
  id: number
  federationId: number
  federationName?: string
  belt: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK'
  modality: 'GI' | 'NOGI' | 'BOTH'
  effectiveFrom: string
  effectiveTo?: string
  sourceUrl?: string
  createdAt: string
  updatedAt: string
}

export type CreateRulesetRequest = {
  federationId: number
  belt: Ruleset['belt']
  modality: Ruleset['modality']
  effectiveFrom: string
  effectiveTo?: string
  sourceUrl?: string
}

export type UpdateRulesetRequest = Partial<CreateRulesetRequest>
