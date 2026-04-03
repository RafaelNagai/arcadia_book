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
}
