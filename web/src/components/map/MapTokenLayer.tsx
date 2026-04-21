import { useEffect, useRef, useState } from 'react'
import { Layer, Circle, Image as KonvaImage, Text, Group, Ring } from 'react-konva'
import type Konva from 'konva'
import type { MapToken, MapTool, FogPatch } from '@/lib/mapTypes'
import { getAccent } from '@/components/character/types'

const TOKEN_RADIUS = 28

function TokenShape({ token, isDraggable, scale, onDrag, onDragEnd }: {
  token: MapToken
  isDraggable: boolean
  scale: number
  onDrag?: (id: string, x: number, y: number) => void
  onDragEnd?: (id: string, x: number, y: number) => void
}) {
  const accent = getAccent(token.character.afinidade)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    if (!token.character.imageUrl) return
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.src = token.character.imageUrl
    i.onload = () => setImg(i)
    return () => { i.onload = null }
  }, [token.character.imageUrl])

  const r = TOKEN_RADIUS

  return (
    <Group
      ref={groupRef}
      x={token.x}
      y={token.y}
      draggable={isDraggable}
      onDragMove={e => onDrag?.(token.id, e.target.x(), e.target.y())}
      onDragEnd={e => onDragEnd?.(token.id, e.target.x(), e.target.y())}
      opacity={token.isVisible ? 1 : 0.4}
    >
      {/* Glow ring */}
      <Ring
        innerRadius={r}
        outerRadius={r + 3 / scale}
        fill={accent.text}
        opacity={0.7}
      />
      {/* Clip circle background */}
      <Circle radius={r} fill={accent.bg} />
      {/* Character image clipped to circle */}
      {img ? (
        <KonvaImage
          image={img}
          width={r * 2}
          height={r * 2}
          x={-r}
          y={-r}
          cornerRadius={r}
          listening={false}
        />
      ) : (
        <Text
          text={token.character.name[0]?.toUpperCase() ?? '?'}
          fontSize={r}
          fill={accent.text}
          x={-r / 2}
          y={-r / 2}
          listening={false}
        />
      )}
      {/* Name label */}
      <Text
        text={token.character.name}
        fontSize={11 / scale}
        fill="#EEF4FC"
        x={-60}
        y={r + 4 / scale}
        width={120}
        align="center"
        listening={false}
      />
    </Group>
  )
}

interface MapTokenLayerProps {
  tokens: MapToken[]
  activeLayerId: string | null
  tool: MapTool
  isGm: boolean
  scale: number
  panX: number
  panY: number
  fogEnabled: boolean
  visionCircles: FogPatch[]
  myCharacterIds: string[]
  onTokenDrag?: (tokenId: string, x: number, y: number) => void
  onTokenMove?: (tokenId: string, x: number, y: number) => void
}

function isInsideAnyCircle(x: number, y: number, circles: FogPatch[]): boolean {
  return circles.some(c => {
    const dx = x - c.x
    const dy = y - c.y
    return dx * dx + dy * dy <= c.radius * c.radius
  })
}

export function MapTokenLayer({
  tokens,
  activeLayerId,
  tool,
  isGm,
  scale,
  panX,
  panY,
  fogEnabled,
  visionCircles,
  myCharacterIds,
  onTokenDrag,
  onTokenMove,
}: MapTokenLayerProps) {
  const visibleTokens = tokens.filter(t => {
    if (t.layerId !== activeLayerId) return false
    if (!isGm && !t.isVisible) return false
    // Own tokens are always visible to the player who owns them
    if (!isGm && myCharacterIds.includes(t.characterId)) return true
    // Other tokens only visible inside vision circles when fog is active
    if (!isGm && fogEnabled && !isInsideAnyCircle(t.x, t.y, visionCircles)) return false
    return true
  })

  return (
    <Layer x={panX} y={panY} scaleX={scale} scaleY={scale}>
      {visibleTokens.map(token => (
        <TokenShape
          key={token.id}
          token={token}
          isDraggable={isGm && tool === 'move'}
          scale={scale}
          onDrag={onTokenDrag}
          onDragEnd={onTokenMove}
        />
      ))}
    </Layer>
  )
}
