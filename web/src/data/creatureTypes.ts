export interface CreatureAttributes {
  fisico: number
  destreza: number
  intelecto: number
  influencia: number
}

export interface CreatureEntry {
  name: string
  description: string
}

export interface CreatureAction {
  name: string
  description: string
  once?: string
}

export interface CreatureVariant {
  name: string
  diceBase: string
  hp: number
  da: number
  note: string
}

export interface Creature {
  name: string
  levelRange: string
  style: string
  image: string | null
  lore: string
  diceBase: string
  hp: number
  da: number
  dp: number
  attributes: CreatureAttributes
  immune: string[]
  vulnerable: string[]
  interactions: CreatureEntry[]
  actions: CreatureAction[]
  reactions: CreatureAction[]
  variants: CreatureVariant[]
}
