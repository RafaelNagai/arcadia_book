export interface MapWall {
  id: string
  mapId: string
  layerId: string
  points: Array<{ x: number; y: number }>
}

export interface MapDoor {
  id: string
  mapId: string
  layerId: string
  points: Array<{ x: number; y: number }>
  isOpen: boolean
}

export interface MapLayer {
  id: string
  mapId: string
  name: string
  orderIndex: number
  imageUrl: string
  isActive: boolean
  fogRevealed: FogPatch[]
  walls: MapWall[]
  doors: MapDoor[]
  createdAt: string
}

export interface MapTokenCharacter {
  id: string
  userId: string
  name: string
  imageUrl: string | null
  afinidade: string
  race: string
}

export interface MapToken {
  id: string
  mapId: string
  layerId: string
  characterId: string
  x: number
  y: number
  visionRadius: number | null
  isVisible: boolean
  size: number
  sharedWith: string[]
  character: MapTokenCharacter
}

export interface FogPatch {
  x: number
  y: number
  radius: number
  polygon?: Array<{ x: number; y: number }>
  characterId?: string
}

export interface Measurement {
  id: string
  userId: string
  type: 'ruler' | 'circle'
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  isLive?: boolean
}

export interface GameMap {
  id: string
  campaignId: string
  title: string
  isActive: boolean
  gridEnabled: boolean
  gridSize: number
  visionUnified: boolean
  defaultVisionRadius: number
  defaultTokenSize: number
  fogEnabled: boolean
  measurements: Measurement[]
  createdAt: string
  layers: MapLayer[]
  tokens?: MapToken[]
}

export type MapTool = 'select' | 'fog' | 'wall' | 'door' | 'ruler' | 'circle'

export interface MapSummary {
  id: string
  campaignId: string
  title: string
  isActive: boolean
  gridEnabled: boolean
  gridSize: number
  defaultVisionRadius: number
  defaultTokenSize: number
  fogEnabled: boolean
  createdAt: string
  layers: Array<{ id: string; name: string; orderIndex: number; imageUrl: string; isActive: boolean }>
  tokens: MapToken[]
}

// ── Measurement color helper ──────────────────────────────────────────────────

const MEASURE_COLORS = ['#E8803A', '#6FC892', '#50C8E8', '#C090F0', '#E8B84B', '#EF4444', '#3B82F6']

export function measureColor(userId: string): string {
  let h = 5381
  for (let i = 0; i < userId.length; i++) h = ((h << 5) + h) ^ userId.charCodeAt(i)
  return MEASURE_COLORS[Math.abs(h) % MEASURE_COLORS.length]
}
