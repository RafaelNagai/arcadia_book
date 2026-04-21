export interface MapWall {
  id: string
  mapId: string
  layerId: string
  points: Array<{ x: number; y: number }>
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
  createdAt: string
}

export interface MapTokenCharacter {
  id: string
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
  character: MapTokenCharacter
}

export interface FogPatch {
  x: number
  y: number
  radius: number
  polygon?: Array<{ x: number; y: number }>
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

export type MapTool = 'select' | 'fog' | 'wall'
