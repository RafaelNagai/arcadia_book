import { useCallback, useEffect, useRef, useState } from 'react'
import { Layer, Circle, Image as KonvaImage, Text, Group, Ring } from 'react-konva'
import type Konva from 'konva'
import type { MapToken, MapTool } from '@/lib/mapTypes'
import type { WallPoint } from '@/lib/fogOfWar'
import { isInsideAnyPolygon } from '@/lib/fogOfWar'
import { getAccent } from '@/components/character/types'
import { constrainToWalls } from '@/lib/wallCollision'
import type { WallSegment } from '@/lib/wallCollision'

const TOKEN_BASE_RADIUS = 28

function TokenShape({ token, isDraggable, scale, walls, onDrag, onDragEnd, onTokenClick }: {
  token: MapToken
  isDraggable: boolean
  scale: number
  walls: WallSegment[]
  onDrag?: (id: string, x: number, y: number) => void
  onDragEnd?: (id: string, x: number, y: number) => void
  onTokenClick?: (id: string) => void
}) {
  const accent = getAccent(token.character.afinidade)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const groupRef = useRef<Konva.Group>(null)
  const lastValidPos = useRef({ x: token.x, y: token.y })

  // Keep mutable refs so the stable callbacks below don't capture stale values
  const wallsRef = useRef(walls)
  wallsRef.current = walls
  const radiusRef = useRef(TOKEN_BASE_RADIUS * (token.size ?? 1))
  radiusRef.current = TOKEN_BASE_RADIUS * (token.size ?? 1)
  const tokenIdRef = useRef(token.id)
  tokenIdRef.current = token.id
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  // Sync lastValidPos when position is updated externally (end of drag, remote move)
  useEffect(() => {
    lastValidPos.current = { x: token.x, y: token.y }
  }, [token.x, token.y])

  useEffect(() => {
    if (!token.character.imageUrl) return
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.src = token.character.imageUrl
    i.onload = () => setImg(i)
    return () => { i.onload = null }
  }, [token.character.imageUrl])

  const r = TOKEN_BASE_RADIUS * (token.size ?? 1)

  // Stable callbacks — empty dep array so Konva never re-binds during drag
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const raw = { x: e.target.x(), y: e.target.y() }
    const w = wallsRef.current
    if (w.length > 0) {
      const constrained = constrainToWalls(lastValidPos.current, raw, w, radiusRef.current)
      e.target.x(constrained.x)
      e.target.y(constrained.y)
      lastValidPos.current = constrained
      onDragRef.current?.(tokenIdRef.current, constrained.x, constrained.y)
    } else {
      lastValidPos.current = raw
      onDragRef.current?.(tokenIdRef.current, raw.x, raw.y)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const w = wallsRef.current
    if (w.length > 0) {
      // Snap to constrained position
      const pos = lastValidPos.current
      e.target.x(pos.x)
      e.target.y(pos.y)
      onDragEndRef.current?.(tokenIdRef.current, pos.x, pos.y)
    } else {
      // GM: use the actual released position directly
      onDragEndRef.current?.(tokenIdRef.current, e.target.x(), e.target.y())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Group
      ref={groupRef}
      x={token.x}
      y={token.y}
      draggable={isDraggable}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => { e.cancelBubble = true; onTokenClick?.(token.id) }}
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
  visionPolygons: WallPoint[][]
  myCharacterIds: string[]
  allowPlayerTokenMove?: boolean
  /** Wall + closed-door segments used for collision; GM tokens bypass this. */
  blockingWalls?: WallSegment[]
  onTokenDrag?: (tokenId: string, x: number, y: number) => void
  onTokenMove?: (tokenId: string, x: number, y: number) => void
  onTokenClick?: (tokenId: string) => void
  /** When true: non-interactive, dimmed, no fog filter (lower floor view) */
  readOnly?: boolean
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
  visionPolygons,
  myCharacterIds,
  allowPlayerTokenMove = true,
  blockingWalls = [],
  onTokenDrag,
  onTokenMove,
  onTokenClick,
  readOnly = false,
}: MapTokenLayerProps) {
  const visibleTokens = tokens.filter(t => {
    if (t.layerId !== activeLayerId) return false
    if (readOnly) {
      if (isGm) return true
      if (fogEnabled) return isInsideAnyPolygon(t.x, t.y, visionPolygons)
      return t.isVisible
    }
    if (isGm) return true
    if (myCharacterIds.includes(t.characterId)) return true
    if (fogEnabled) return isInsideAnyPolygon(t.x, t.y, visionPolygons)
    return t.isVisible
  })

  const canDrag = (token: MapToken) =>
    !readOnly && tool === 'select' && (isGm || (allowPlayerTokenMove && myCharacterIds.includes(token.characterId)))

  return (
    <Layer
      x={panX} y={panY} scaleX={scale} scaleY={scale}
      opacity={readOnly ? 0.45 : 1}
      listening={readOnly || tool === 'ruler' || tool === 'circle' ? false : undefined}
    >
      {visibleTokens.map(token => (
        <TokenShape
          key={token.id}
          token={token}
          isDraggable={canDrag(token)}
          scale={scale}
          walls={readOnly || isGm ? [] : blockingWalls}
          onDrag={readOnly ? undefined : onTokenDrag}
          onDragEnd={readOnly ? undefined : onTokenMove}
          onTokenClick={readOnly ? undefined : onTokenClick}
        />
      ))}
    </Layer>
  )
}
