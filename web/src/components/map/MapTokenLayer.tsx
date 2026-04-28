import { useCallback, useEffect, useRef, useState } from 'react'
import { Layer, Circle, Image as KonvaImage, Text, Group, Ring } from 'react-konva'
import type Konva from 'konva'
import type { MapToken, MapTool, CreatureInstance } from '@/lib/mapTypes'
import type { WallPoint } from '@/lib/fogOfWar'
import { isInsideAnyPolygon } from '@/lib/fogOfWar'
import { getAccent } from '@/components/character/types'
import { constrainToWalls } from '@/lib/wallCollision'
import type { WallSegment } from '@/lib/wallCollision'

const CREATURE_RING_COLOR = '#A03020'
const CREATURE_BG_COLOR = 'rgba(160,48,32,0.25)'

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

function CreatureTokenShape({ instance, isDraggable, isGm, scale, onDrag, onDragEnd, onClick }: {
  instance: CreatureInstance
  isDraggable: boolean
  isGm: boolean
  scale: number
  onDrag?: (id: string, x: number, y: number) => void
  onDragEnd?: (id: string, x: number, y: number) => void
  onClick?: (id: string) => void
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const lastValidPos = useRef({ x: instance.x, y: instance.y })
  const instanceIdRef = useRef(instance.instanceId)
  instanceIdRef.current = instance.instanceId
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag
  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  const r = TOKEN_BASE_RADIUS * (instance.size ?? 1)

  useEffect(() => {
    lastValidPos.current = { x: instance.x, y: instance.y }
  }, [instance.x, instance.y])

  useEffect(() => {
    if (!instance.image) return
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.src = instance.image
    i.onload = () => setImg(i)
    return () => { i.onload = null }
  }, [instance.image])

  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const raw = { x: e.target.x(), y: e.target.y() }
    lastValidPos.current = raw
    onDragRef.current?.(instanceIdRef.current, raw.x, raw.y)
  }, [])

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEndRef.current?.(instanceIdRef.current, e.target.x(), e.target.y())
  }, [])

  return (
    <Group
      x={instance.x}
      y={instance.y}
      draggable={isDraggable}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => { e.cancelBubble = true; onClick?.(instance.instanceId) }}
    >
      <Ring innerRadius={r} outerRadius={r + 3 / scale} fill={CREATURE_RING_COLOR} opacity={0.85} />
      <Circle radius={r} fill={CREATURE_BG_COLOR} />
      {img ? (
        <KonvaImage image={img} width={r * 2} height={r * 2} x={-r} y={-r} cornerRadius={r} listening={false} />
      ) : (
        <Text
          text={instance.creatureName[0]?.toUpperCase() ?? '?'}
          fontSize={r}
          fill={CREATURE_RING_COLOR}
          x={-r / 2}
          y={-r / 2}
          listening={false}
        />
      )}
      <Text
        text={instance.creatureName}
        fontSize={11 / scale}
        fill="#F0D0C0"
        x={-60}
        y={r + 4 / scale}
        width={120}
        align="center"
        listening={false}
      />
      {/* HP indicator — GM only */}
      {isGm && (
        <Text
          text={`${instance.currentHp}/${instance.maxHp}`}
          fontSize={9 / scale}
          fill={instance.currentHp < instance.maxHp * 0.4 ? '#FF6666' : '#A0C090'}
          x={-24}
          y={-r - 14 / scale}
          width={48}
          align="center"
          listening={false}
        />
      )}
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
  creatureInstances?: CreatureInstance[]
  onTokenDrag?: (tokenId: string, x: number, y: number) => void
  onTokenMove?: (tokenId: string, x: number, y: number) => void
  onTokenClick?: (tokenId: string) => void
  onCreatureInstanceDrag?: (instanceId: string, x: number, y: number) => void
  onCreatureInstanceMove?: (instanceId: string, x: number, y: number) => void
  onCreatureInstanceClick?: (instanceId: string) => void
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
  creatureInstances = [],
  onTokenDrag,
  onTokenMove,
  onTokenClick,
  onCreatureInstanceDrag,
  onCreatureInstanceMove,
  onCreatureInstanceClick,
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

  const visibleCreatures = creatureInstances.filter(i => i.placed && i.layerId === activeLayerId && !readOnly)

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
      {visibleCreatures.map(instance => (
        <CreatureTokenShape
          key={instance.instanceId}
          instance={instance}
          isDraggable={isGm && tool === 'select'}
          isGm={isGm}
          scale={scale}
          onDrag={onCreatureInstanceDrag}
          onDragEnd={onCreatureInstanceMove}
          onClick={onCreatureInstanceClick}
        />
      ))}
    </Layer>
  )
}
