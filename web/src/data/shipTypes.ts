import type { SectorCategoryKey } from '@/data/shipSectorCatalog'
import { slugifyHeading } from '@/data/slugify'

export interface ShipSector {
  name: string
  category: 'Armamento' | 'Casco' | 'Velas' | 'Radar' | 'Dormitório' | 'Cozinha' | 'Biblioteca' | 'Armazém'
  slots: number
  effect: string
  test: string
}

export interface Ship {
  name: string
  type: string
  size: 'Esquife' | 'Corveta' | 'Fragata' | 'Galeão' | 'Leviatã'
  image: string | null
  lore: string
  hp: number
  dn: number
  slots: { total: number; used: number }
  captainAttribute: 'Destreza' | 'Influência'
  sectors: ShipSector[]
  traits: string[]
}

// ── Navios estáticos (ships.json) ────────────────────────────────────────────

export interface NormalizedShip extends Ship {
  id: string
}

export function normalizeShip(ship: Ship): NormalizedShip {
  return { ...ship, id: slugifyHeading(ship.name) }
}

// ── Ficha de navio persistida (API) ──────────────────────────────────────────

export type ShipKind = 'Material' | 'Organico'

export interface InstalledSector {
  id: string
  category: SectorCategoryKey
  key: string
}

export interface ShipCrewMember {
  id: string
  characterId: string
  name: string
  imageUrl: string | null
  isPublic: boolean
  userId: string
  joinedAt: string
}

export interface ApiShip {
  id: string
  userId: string
  name: string
  motto: string
  type: ShipKind
  porte: string
  imageUrl: string | null
  description: string
  slotsTotal: number
  hp: number
  currentHp: number | null
  sectors: InstalledSector[]
  crewCode?: string
  isPublic: boolean
  crew?: ShipCrewMember[]
  createdAt: string
  updatedAt: string
}

export type MoralAction =
  | { action: 'roll' }
  | { action: 'add' }
  | { action: 'remove'; index: number }
  | { action: 'adjust'; index: number; delta: 1 | -1 }
  | { action: 'set'; index: number; value: number }

export interface MoralLogEntry {
  id: string
  timestamp: number
  action: 'roll' | 'add' | 'remove' | 'adjust' | 'set'
  detail: string
  pool: number[]
}

export interface ShipStateData {
  id: string
  shipId: string
  moralPool: number[]
  moralLog: MoralLogEntry[]
  createdAt: string
  updatedAt: string
}
