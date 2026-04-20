export interface MapLayer {
  id: string
  mapId: string
  name: string
  orderIndex: number
  imageUrl: string
  isActive: boolean
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
  character: MapTokenCharacter
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
  createdAt: string
  layers: MapLayer[]
  tokens?: MapToken[]
}

export type MapTool = 'select' | 'move'
