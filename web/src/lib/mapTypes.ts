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
  characterId?: string  // undefined = GM-placed (visible to all); set = only visible to that character's owner/sharers
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
  fogEnabled: boolean
  createdAt: string
  layers: MapLayer[]
  tokens?: MapToken[]
}

export type MapTool = 'select' | 'fog' | 'wall' | 'door'

export interface MapSummary {
  id: string
  campaignId: string
  title: string
  isActive: boolean
  gridEnabled: boolean
  gridSize: number
  defaultVisionRadius: number
  fogEnabled: boolean
  createdAt: string
  layers: Array<{ id: string; name: string; orderIndex: number; imageUrl: string; isActive: boolean }>
  tokens: MapToken[]
}
