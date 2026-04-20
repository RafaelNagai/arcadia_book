export interface CampaignChar {
  id: string
  name: string
  race: string
  afinidade: string
  imageUrl: string | null
  isPublic: boolean
  userId: string
  level: number
  concept: string
  campaignCharacterId: string
}

export interface CampaignSummary {
  id: string
  gmUserId: string
  title: string
  description: string
  imageUrl: string | null
  inviteCode?: string
  isGm: boolean
  playerCount: number
  createdAt: string
}

export interface CampaignDetail {
  id: string
  gmUserId: string
  title: string
  description: string
  imageUrl: string | null
  inviteCode?: string
  isGm: boolean
  players: CampaignChar[]
  npcs: CampaignChar[]
}
