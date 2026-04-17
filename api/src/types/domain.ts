export interface CharacterAttributes {
  fisico: number
  destreza: number
  intelecto: number
  influencia: number
}

export interface CharacterSkills {
  fortitude: number
  vontade: number
  atletismo: number
  combate: number
  furtividade: number
  precisao: number
  acrobacia: number
  reflexo: number
  percepcao: number
  intuicao: number
  investigacao: number
  conhecimento: number
  empatia: number
  dominacao: number
  persuasao: number
  performance: number
}

export interface Character {
  id: string
  user_id: string
  name: string
  race: string
  concept: string
  quote: string
  image_url: string | null
  level: number
  attributes: CharacterAttributes
  skills: CharacterSkills
  talents: string[]
  hp: number
  sanidade: number
  current_hp: number | null
  current_sanidade: number | null
  afinidade: string
  antitese: string
  entropia: number
  runas: string[]
  traumas: string[]
  antecedentes: string[]
  historia: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type WeightCategory =
  | 'nulo'
  | 'super_leve'
  | 'leve'
  | 'medio'
  | 'pesado'
  | 'super_pesado'
  | 'massivo'
  | 'hyper_massivo'

export interface InventoryBag {
  id: string
  character_id: string
  name: string
  slots: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  character_id: string
  bag_id: string | null
  name: string
  description: string
  weight: WeightCategory
  is_equipment: boolean
  max_durability: number | null
  current_durability: number | null
  image_url: string | null
  catalog_image: string | null
  from_catalog: boolean
  catalog_subcategory: string | null
  catalog_tier: string | null
  damage: string | null
  effects: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CharacterState {
  id: string
  character_id: string
  user_id: string
  pe_checks: Record<string, boolean[]>
  skill_modifiers: Record<string, number>
  defense_modifiers: { daBase: number; daBonus: number; dpBonus: number }
  dice_log: DiceLogEntry[]
  created_at: string
  updated_at: string
}

export interface DiceLogEntry {
  id: string
  skill: string
  roll: number[]
  total: number
  result: 'critico' | 'acerto' | 'falha' | 'falha_critica'
  timestamp: number
}
