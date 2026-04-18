export type WeightCategory =
  | 'nulo'
  | 'super_leve'
  | 'leve'
  | 'medio'
  | 'pesado'
  | 'super_pesado'
  | 'massivo'
  | 'hyper_massivo'

export const WEIGHT_VALUES: Record<WeightCategory, number> = {
  nulo: 0,
  super_leve: 1,
  leve: 2,
  medio: 4,
  pesado: 8,
  super_pesado: 16,
  massivo: 32,
  hyper_massivo: 64,
}

export const WEIGHT_LABELS: Record<WeightCategory, string> = {
  nulo: 'Nulo',
  super_leve: 'Super Leve',
  leve: 'Leve',
  medio: 'Médio',
  pesado: 'Pesado',
  super_pesado: 'Super Pesado',
  massivo: 'Massivo',
  hyper_massivo: 'Hyper Massivo',
}

export interface InventoryBag {
  id: string
  name: string
  slots: number
  items: InventoryItem[]
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  weight: WeightCategory
  isEquipment: boolean
  maxDurability?: number
  currentDurability?: number
  /** Custom image URL entered by the user — overrides catalogImage when set */
  image?: string | null
  /** Original image path from the equipment catalog (set when fromCatalog is true) */
  catalogImage?: string | null
  /** true when this item was added from the equipment catalog */
  fromCatalog?: boolean
  /** Catalog display metadata (subcategory + tier shown in header) */
  catalogSubcategory?: string
  catalogTier?: string
  /** Unified stats — present for both catalog and custom items */
  damage?: string | null
  effects?: string[]
}

export interface CharacterSkills {
  // Físico
  fortitude: number
  vontade: number
  atletismo: number
  combate: number
  // Destreza
  furtividade: number
  precisao: number
  acrobacia: number
  reflexo: number
  // Intelecto
  percepcao: number
  intuicao: number
  investigacao: number
  conhecimento: number
  // Influência
  empatia: number
  dominacao: number
  persuasao: number
  performance: number
}

export interface CharacterAttributes {
  fisico: number
  destreza: number
  intelecto: number
  influencia: number
}

export interface Character {
  id: string
  name: string
  race: string
  concept: string
  quote: string
  image: string | null
  level: number
  attributes: CharacterAttributes
  skills: CharacterSkills
  talents: string[]
  hp: number
  sanidade: number
  // Tracked current values (only set for owned/custom characters)
  currentHp?: number
  currentSanidade?: number
  // true for characters created by the user and stored in localStorage
  // TODO (future): replace with server-side ownership/auth check
  owned?: boolean
  afinidade: string
  antitese: string
  entropia: number
  runas: string[]
  traumas: string[]
  antecedentes: string[]
  historia?: string
  campaign?: { id: string; title: string; role: 'player' | 'npc' } | null
}
