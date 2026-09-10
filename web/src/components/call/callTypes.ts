export interface CallTileData {
  key: string
  userId: string
  stream: MediaStream | null
  audioTrack: MediaStreamTrack | null
  displayName: string
  subtitle?: string
  image: string | null
  characterId: string | null
  hp: number | null
  maxHp: number | null
  isGm: boolean
  muted: boolean
  volume: number
  cameraEnabled: boolean
  canViewSheet: boolean
}
