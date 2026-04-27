import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Group, Rect, Ring, Circle } from 'react-konva'
import type Konva from 'konva'
import type { MapLayer, MapToken, GameMap, MapTool, FogPatch, Measurement } from '@/lib/mapTypes'
import { measureColor } from '@/lib/mapTypes'
import { computeVisibilityPolygon } from '@/lib/fogOfWar'
import { MapTokenLayer } from './MapTokenLayer'
import { MapFogLayer } from './MapFogLayer'
import { MapWallLayer } from './MapWallLayer'
import { MapDoorLayer } from './MapDoorLayer'
import { MapMeasureLayer } from './MapMeasureLayer'

const TOKEN_BASE_RADIUS = 28
const MEASURE_THROTTLE_MS = 40

// ── SelectionHandle ───────────────────────────────────────────────────────────

function SelectionHandle({ token, scale, onResize }: {
  token: MapToken
  scale: number
  onResize?: (tokenId: string, size: number) => void
}) {
  const ringRef = useRef<Konva.Ring>(null)
  const handleRef = useRef<Konva.Circle>(null)
  const r = TOKEN_BASE_RADIUS * (token.size ?? 1)

  const onDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const dx = e.target.x() - token.x
    const dy = e.target.y() - token.y
    const dist = Math.max(TOKEN_BASE_RADIUS * 0.25, Math.sqrt(dx * dx + dy * dy))
    const angle = Math.atan2(dy, dx)
    e.target.x(token.x + dist * Math.cos(angle))
    e.target.y(token.y + dist * Math.sin(angle))
    if (ringRef.current) {
      ringRef.current.innerRadius(dist)
      ringRef.current.outerRadius(dist + 3 / scale)
      ringRef.current.getLayer()?.batchDraw()
    }
  }, [token.x, token.y, scale])

  const onDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const dx = e.target.x() - token.x
    const dy = e.target.y() - token.y
    const dist = Math.max(TOKEN_BASE_RADIUS * 0.25, Math.sqrt(dx * dx + dy * dy))
    onResize?.(token.id, dist / TOKEN_BASE_RADIUS)
  }, [token.x, token.y, token.id, onResize])

  return (
    <>
      <Ring
        ref={ringRef}
        x={token.x} y={token.y}
        innerRadius={r}
        outerRadius={r + 3 / scale}
        fill="rgba(200,146,42,0.65)"
        listening={false}
      />
      <Circle
        ref={handleRef}
        x={token.x + r} y={token.y}
        radius={6 / scale}
        fill="rgba(200,146,42,0.9)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1 / scale}
        draggable
        onClick={(e) => { e.cancelBubble = true }}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        style={{ cursor: 'nwse-resize' }}
      />
    </>
  )
}

// ── MapCanvas ─────────────────────────────────────────────────────────────────

interface MapCanvasProps {
  map: GameMap
  allLayers: MapLayer[]
  currentLayerId: string | null
  tokens: MapToken[]
  tool: MapTool
  isGm: boolean
  containerWidth: number
  containerHeight: number
  fogEnabled: boolean
  userId?: string
  myCharacterIds: string[]
  npcCharacterIds: string[]
  dragOverride: { tokenId: string; x: number; y: number } | null
  localFogPatches: FogPatch[]
  measurements: Measurement[]
  liveMeasurements: Measurement[]
  viewportOverride?: { scale: number; x: number; y: number } | null
  allowPlayerTokenMove?: boolean
  allowPlayerDraw?: boolean
  onViewportChange?: (scale: number, x: number, y: number) => void
  onTokenDrag?: (tokenId: string, x: number, y: number) => void
  onTokenMove?: (tokenId: string, x: number, y: number) => void
  onTokenResize?: (tokenId: string, size: number) => void
  onTokenEdit?: (tokenId: string) => void
  onTokenDrop?: (charId: string, worldX: number, worldY: number, visionRadius: number | null) => void
  onFogReveal?: (patch: FogPatch) => void
  onWallAdd?: (points: Array<{ x: number; y: number }>) => void
  onWallDelete?: (wallId: string) => void
  onDoorAdd?: (points: Array<{ x: number; y: number }>) => void
  onDoorDelete?: (doorId: string) => void
  onDoorToggle?: (doorId: string) => void
  onMeasurementAdd?: (m: Measurement) => void
  onMeasurementRemoveSelf?: () => void
  onMeasurementLive?: (m: Measurement) => void
}

function isOnDraggable(node: Konva.Node): boolean {
  let n: Konva.Node | null = node
  while (n && n.getClassName() !== 'Stage') {
    if ((n as { draggable?: () => boolean }).draggable?.()) return true
    n = n.getParent()
  }
  return false
}

export function MapCanvas({
  map,
  allLayers,
  currentLayerId,
  tokens,
  tool,
  isGm,
  containerWidth,
  containerHeight,
  fogEnabled,
  userId,
  myCharacterIds,
  npcCharacterIds,
  dragOverride,
  localFogPatches,
  measurements,
  liveMeasurements,
  viewportOverride,
  allowPlayerTokenMove = true,
  allowPlayerDraw = true,
  onViewportChange,
  onTokenDrag,
  onTokenMove,
  onTokenResize,
  onTokenEdit,
  onTokenDrop,
  onFogReveal,
  onWallAdd,
  onWallDelete,
  onDoorAdd,
  onDoorDelete,
  onDoorToggle,
  onMeasurementAdd,
  onMeasurementRemoveSelf,
  onMeasurementLive,
}: MapCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [layerImages, setLayerImages] = useState<Record<string, HTMLImageElement>>({})
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const hasFitted = useRef(false)

  const stateRef = useRef({ scale, position })
  stateRef.current = { scale, position }

  // Notify parent of viewport changes (throttled)
  const lastViewportBroadcast = useRef(0)
  const onViewportChangeRef = useRef(onViewportChange)
  onViewportChangeRef.current = onViewportChange
  useEffect(() => {
    const now = Date.now()
    if (now - lastViewportBroadcast.current < 80) return
    lastViewportBroadcast.current = now
    onViewportChangeRef.current?.(scale, position.x, position.y)
  }, [scale, position])

  // Apply viewport override from GM (FOCUS_ALL)
  useEffect(() => {
    if (!viewportOverride) return
    hasFitted.current = true // prevent auto-fit from overriding
    setScale(viewportOverride.scale)
    setPosition({ x: viewportOverride.x, y: viewportOverride.y })
  }, [viewportOverride])

  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

  const lastPinchDist = useRef<number | null>(null)
  const isTouchPanning = useRef(false)
  const lastTouchPos = useRef({ x: 0, y: 0 })

  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null)
  const [wallPreview, setWallPreview] = useState<{ x: number; y: number } | null>(null)
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)
  const [doorStart, setDoorStart] = useState<{ x: number; y: number } | null>(null)
  const [doorPreview, setDoorPreview] = useState<{ x: number; y: number } | null>(null)
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null)
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)

  // Measurement local state
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null)
  const [measurePreview, setMeasurePreview] = useState<{ x: number; y: number } | null>(null)
  const measureStartRef = useRef<{ x: number; y: number } | null>(null)
  measureStartRef.current = measureStart
  const lastMeasureBroadcast = useRef(0)

  const sortedLayers = [...allLayers].sort((a, b) => a.orderIndex - b.orderIndex)
  const currentLayerIndex = sortedLayers.findIndex(l => l.id === currentLayerId)
  const currentLayer = currentLayerIndex >= 0 ? sortedLayers[currentLayerIndex] : (sortedLayers[sortedLayers.length - 1] ?? null)
  const layersToRender = currentLayerIndex >= 0
    ? sortedLayers.slice(0, currentLayerIndex + 1)
    : sortedLayers.length > 0 ? [sortedLayers[sortedLayers.length - 1]] : []

  const layerImageUrlsKey = allLayers.map(l => `${l.id}:${l.imageUrl}`).join('|')
  useEffect(() => {
    const cleanup: (() => void)[] = []
    for (const layer of allLayers) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = layer.imageUrl
      img.onload = () => setLayerImages(prev => ({ ...prev, [layer.id]: img }))
      img.onerror = () => {}
      cleanup.push(() => { img.onload = null; img.onerror = null })
    }
    return () => cleanup.forEach(f => f())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerImageUrlsKey])

  useEffect(() => { hasFitted.current = false }, [map.id])

  const currentLayerImage = currentLayer ? layerImages[currentLayer.id] ?? null : null
  useEffect(() => {
    if (hasFitted.current || viewportOverride || !currentLayerImage || containerWidth === 0 || containerHeight === 0) return
    hasFitted.current = true
    const fit = Math.min(containerWidth / currentLayerImage.naturalWidth, containerHeight / currentLayerImage.naturalHeight)
    setScale(fit)
    setPosition({
      x: (containerWidth - currentLayerImage.naturalWidth * fit) / 2,
      y: (containerHeight - currentLayerImage.naturalHeight * fit) / 2,
    })
  }, [currentLayerImage, containerWidth, containerHeight, viewportOverride])

  // Reset drawing state when tool changes
  useEffect(() => {
    if (tool !== 'wall') { setWallStart(null); setWallPreview(null); setSelectedWallId(null) }
    if (tool !== 'door') { setDoorStart(null); setDoorPreview(null); setSelectedDoorId(null) }
    if (tool !== 'ruler' && tool !== 'circle') { setMeasureStart(null); setMeasurePreview(null) }
  }, [tool])

  useEffect(() => { setSelectedTokenId(null) }, [tool])

  // ESC key handler for all drawing tools
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (tool === 'wall' || tool === 'door') {
        setWallStart(null); setSelectedWallId(null)
        setDoorStart(null); setSelectedDoorId(null)
      }
      if (tool === 'ruler' || tool === 'circle') {
        if (measureStartRef.current) {
          setMeasureStart(null)
          setMeasurePreview(null)
        } else {
          onMeasurementRemoveSelf?.()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tool, onMeasurementRemoveSelf])

  const getWorldPos = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return null
    const pointer = stage.getPointerPosition()
    if (!pointer) return null
    const { position: pos, scale: sc } = stateRef.current
    return { x: (pointer.x - pos.x) / sc, y: (pointer.y - pos.y) / sc }
  }, [])

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const { scale: oldScale, position: pos } = stateRef.current
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const factor = e.evt.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.max(0.05, Math.min(8, oldScale * factor))
    const worldX = (pointer.x - pos.x) / oldScale
    const worldY = (pointer.y - pos.y) / oldScale
    setScale(newScale)
    setPosition({ x: pointer.x - worldX * newScale, y: pointer.y - worldY * newScale })
  }, [])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'select') {
      if (!isOnDraggable(e.target)) {
        isPanning.current = true
        lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      }
    } else if (tool === 'fog' && isGm) {
      const wp = getWorldPos()
      if (wp) onFogReveal?.({ x: wp.x, y: wp.y, radius: map.defaultVisionRadius })
    }
  }, [tool, isGm, map.defaultVisionRadius, onFogReveal, getWorldPos])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      const dx = e.evt.clientX - lastPan.current.x
      const dy = e.evt.clientY - lastPan.current.y
      lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    }
    if (tool === 'wall' && isGm) { const wp = getWorldPos(); if (wp) setWallPreview(wp) }
    if (tool === 'door' && isGm) { const wp = getWorldPos(); if (wp) setDoorPreview(wp) }
    if ((tool === 'ruler' || tool === 'circle') && measureStartRef.current && (isGm || allowPlayerDraw)) {
      const wp = getWorldPos()
      if (!wp) return
      setMeasurePreview(wp)
      const now = Date.now()
      if (now - lastMeasureBroadcast.current >= MEASURE_THROTTLE_MS) {
        lastMeasureBroadcast.current = now
        const start = measureStartRef.current
        onMeasurementLive?.({
          id: userId ?? 'unknown',
          userId: userId ?? 'unknown',
          type: tool,
          x1: start.x, y1: start.y,
          x2: wp.x, y2: wp.y,
          color: measureColor(userId ?? ''),
          isLive: true,
        })
      }
    }
  }, [tool, isGm, allowPlayerDraw, userId, getWorldPos, onMeasurementLive])

  const handleMouseUp = useCallback(() => { isPanning.current = false }, [])

  const handleTouchStart = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches
    if (touches.length === 2) {
      e.evt.preventDefault()
      const t1 = touches[0], t2 = touches[1]
      lastPinchDist.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      isTouchPanning.current = false
    } else if (touches.length === 1 && tool === 'select') {
      if (!isOnDraggable(e.target)) {
        e.evt.preventDefault()
        isTouchPanning.current = true
        lastTouchPos.current = { x: touches[0].clientX, y: touches[0].clientY }
      }
    }
  }, [tool])

  const handleTouchMove = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches
    if (touches.length === 2) {
      e.evt.preventDefault()
      const t1 = touches[0], t2 = touches[1]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      const cx = (t1.clientX + t2.clientX) / 2
      const cy = (t1.clientY + t2.clientY) / 2
      if (lastPinchDist.current) {
        const { scale: oldScale, position: pos } = stateRef.current
        const factor = dist / lastPinchDist.current
        const newScale = Math.max(0.05, Math.min(8, oldScale * factor))
        const worldX = (cx - pos.x) / oldScale
        const worldY = (cy - pos.y) / oldScale
        setScale(newScale)
        setPosition({ x: cx - worldX * newScale, y: cy - worldY * newScale })
      }
      lastPinchDist.current = dist
    } else if (touches.length === 1 && isTouchPanning.current) {
      e.evt.preventDefault()
      const dx = touches[0].clientX - lastTouchPos.current.x
      const dy = touches[0].clientY - lastTouchPos.current.y
      lastTouchPos.current = { x: touches[0].clientX, y: touches[0].clientY }
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    isTouchPanning.current = false
    lastPinchDist.current = null
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const charId = e.dataTransfer.getData('charId')
    if (!charId) return
    const vrStr = e.dataTransfer.getData('visionRadius')
    const visionRadius = vrStr !== '' ? Number(vrStr) : null
    const { scale: sc, position: pos } = stateRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const worldX = (e.clientX - rect.left - pos.x) / sc
    const worldY = (e.clientY - rect.top - pos.y) / sc
    onTokenDrop?.(charId, worldX, worldY, visionRadius)
  }, [onTokenDrop])

  const handleClick = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    setSelectedTokenId(null)

    if ((tool === 'ruler' || tool === 'circle') && (isGm || allowPlayerDraw)) {
      const wp = getWorldPos(); if (!wp) return
      if (!measureStart) {
        setMeasureStart(wp)
      } else {
        const m: Measurement = {
          id: userId ?? 'unknown',
          userId: userId ?? 'unknown',
          type: tool,
          x1: measureStart.x, y1: measureStart.y,
          x2: wp.x, y2: wp.y,
          color: measureColor(userId ?? ''),
        }
        onMeasurementAdd?.(m)
        setMeasureStart(null)
        setMeasurePreview(null)
      }
      return
    }

    if (!isGm) return

    if (tool === 'select') {
      setSelectedWallId(null)
      setSelectedDoorId(null)
      return
    }

    if (tool === 'wall') {
      if (selectedWallId !== null) { setSelectedWallId(null); return }
      const wp = getWorldPos(); if (!wp) return
      if (!wallStart) { setWallStart(wp) } else { onWallAdd?.([wallStart, wp]); setWallStart(null) }
      return
    }

    if (tool === 'door') {
      if (selectedDoorId !== null) { setSelectedDoorId(null); return }
      const wp = getWorldPos(); if (!wp) return
      if (!doorStart) { setDoorStart(wp) } else { onDoorAdd?.([doorStart, wp]); setDoorStart(null) }
      return
    }
  }, [tool, isGm, allowPlayerDraw, measureStart, userId, wallStart, selectedWallId, doorStart, selectedDoorId, onWallAdd, onDoorAdd, onMeasurementAdd, getWorldPos])

  const handleWallEndpointClick = useCallback((point: { x: number; y: number }) => {
    setSelectedWallId(null); setSelectedDoorId(null)
    if (tool === 'door') {
      if (doorStart) { onDoorAdd?.([doorStart, point]); setDoorStart(null) }
      else { setDoorStart(point) }
    } else {
      if (wallStart) { onWallAdd?.([wallStart, point]); setWallStart(null) }
      else { setWallStart(point) }
    }
  }, [tool, wallStart, doorStart, onWallAdd, onDoorAdd])

  const closedDoors = (currentLayer?.doors ?? []).filter(d => !d.isOpen)
  const walls = [
    ...(currentLayer?.walls ?? []),
    ...closedDoors.map(d => ({ id: d.id, mapId: d.mapId, layerId: d.layerId, points: d.points })),
  ]
  const visionCircles: FogPatch[] = tokens
    .filter(t =>
      t.layerId === currentLayer?.id &&
      !npcCharacterIds.includes(t.characterId) &&
      (isGm || myCharacterIds.includes(t.characterId) || (userId != null && t.sharedWith.includes(userId))),
    )
    .map(t => {
      const pos = dragOverride?.tokenId === t.id
        ? { x: dragOverride.x, y: dragOverride.y }
        : { x: t.x, y: t.y }
      return { ...pos, radius: t.visionRadius ?? map.defaultVisionRadius }
    })

  const visionPolygons = fogEnabled
    ? visionCircles.map(c => computeVisibilityPolygon({ x: c.x, y: c.y }, c.radius, walls))
    : []

  const accessibleCharIds = new Set([
    ...myCharacterIds,
    ...tokens.filter(t => userId != null && t.sharedWith.includes(userId ?? '')).map(t => t.characterId),
  ])
  const rawFogPatches = [...(currentLayer?.fogRevealed ?? []), ...localFogPatches]
  const effectiveFogPatches = isGm
    ? rawFogPatches
    : rawFogPatches.filter(p => p.characterId == null || accessibleCharIds.has(p.characterId))

  // Build local preview measurement
  const localPreview: Measurement | null = (measureStart && measurePreview && userId)
    ? {
      id: `${userId}-preview`,
      userId,
      type: tool as 'ruler' | 'circle',
      x1: measureStart.x, y1: measureStart.y,
      x2: measurePreview.x, y2: measurePreview.y,
      color: measureColor(userId),
      isLive: true,
    }
    : null

  const allMeasurements = [
    ...measurements,
    ...liveMeasurements.filter(m => m.userId !== userId),
    ...(localPreview ? [localPreview] : []),
  ]

  const selectedWall = walls.find(w => w.id === selectedWallId)
  const wallHudPos = selectedWall && selectedWall.points.length >= 2 ? {
    x: ((selectedWall.points[0].x + selectedWall.points[1].x) / 2) * scale + position.x,
    y: ((selectedWall.points[0].y + selectedWall.points[1].y) / 2) * scale + position.y,
  } : null

  const selectedToken = selectedTokenId ? tokens.find(t => t.id === selectedTokenId) : null
  const tokenHudPos = selectedToken ? {
    x: selectedToken.x * scale + position.x,
    y: (selectedToken.y - TOKEN_BASE_RADIUS * (selectedToken.size ?? 1)) * scale + position.y,
  } : null

  const stageW = containerWidth || window.innerWidth
  const stageH = containerHeight || window.innerHeight
  const isMeasuring = tool === 'ruler' || tool === 'circle'
  const cursorStyle = isMeasuring ? 'crosshair' : (tool === 'fog' || tool === 'wall' || tool === 'door') ? 'crosshair' : 'grab'

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        style={{ background: '#04060C', cursor: cursorStyle, touchAction: 'none' }}
      >
        {layersToRender.map(layer => {
          const img = layerImages[layer.id]
          const isCurrent = layer.id === currentLayer?.id
          return (
            <>
              <Layer key={`img-${layer.id}`}>
                <Group
                  x={position.x} y={position.y}
                  scaleX={scale} scaleY={scale}
                >
                  {img ? (
                    <KonvaImage image={img} width={img.naturalWidth} height={img.naturalHeight} />
                  ) : (
                    isCurrent && <Rect width={stageW / scale} height={stageH / scale} fill="#0A0F1E" />
                  )}
                  {!isCurrent && img && (
                    <Rect
                      x={0} y={0}
                      width={img.naturalWidth} height={img.naturalHeight}
                      fill="rgba(0,0,0,0.55)"
                      listening={false}
                    />
                  )}
                  {isCurrent && map.gridEnabled && img && (
                    <>
                      {Array.from({ length: Math.ceil(img.naturalWidth / map.gridSize) + 1 }, (_, i) => (
                        <Line key={`vl${i}`} points={[i * map.gridSize, 0, i * map.gridSize, img.naturalHeight]} stroke="rgba(255,255,255,0.15)" strokeWidth={1 / scale} />
                      ))}
                      {Array.from({ length: Math.ceil(img.naturalHeight / map.gridSize) + 1 }, (_, i) => (
                        <Line key={`hl${i}`} points={[0, i * map.gridSize, img.naturalWidth, i * map.gridSize]} stroke="rgba(255,255,255,0.15)" strokeWidth={1 / scale} />
                      ))}
                    </>
                  )}
                </Group>
              </Layer>

              {isCurrent ? (
                <MapTokenLayer
                  key={`tok-${layer.id}`}
                  tokens={tokens}
                  activeLayerId={layer.id}
                  tool={tool}
                  isGm={isGm}
                  scale={scale}
                  panX={position.x}
                  panY={position.y}
                  fogEnabled={fogEnabled}
                  visionPolygons={visionPolygons}
                  myCharacterIds={myCharacterIds}
                  allowPlayerTokenMove={allowPlayerTokenMove}
                  onTokenDrag={onTokenDrag}
                  onTokenMove={onTokenMove}
                  onTokenClick={setSelectedTokenId}
                />
              ) : (
                <MapTokenLayer
                  key={`tok-${layer.id}`}
                  tokens={tokens}
                  activeLayerId={layer.id}
                  tool={tool}
                  isGm={isGm}
                  scale={scale}
                  panX={position.x}
                  panY={position.y}
                  fogEnabled={fogEnabled}
                  visionPolygons={visionPolygons}
                  myCharacterIds={myCharacterIds}
                  readOnly
                />
              )}
            </>
          )
        })}

        {fogEnabled && (
          <MapFogLayer
            enabled={fogEnabled}
            isGm={isGm}
            panX={position.x}
            panY={position.y}
            scale={scale}
            visionPolygons={visionPolygons}
            revealedPatches={effectiveFogPatches}
          />
        )}

        {isGm && (
          <MapWallLayer
            walls={currentLayer?.walls ?? []}
            panX={position.x}
            panY={position.y}
            scale={scale}
            wallStart={wallStart}
            previewPoint={tool === 'wall' ? wallPreview : null}
            selectedWallId={selectedWallId}
            onWallSelect={id => { setSelectedWallId(id); setSelectedDoorId(null) }}
            onEndpointClick={handleWallEndpointClick}
          />
        )}

        {isGm && (
          <MapDoorLayer
            doors={currentLayer?.doors ?? []}
            panX={position.x}
            panY={position.y}
            scale={scale}
            tool={tool}
            doorStart={doorStart}
            previewPoint={tool === 'door' ? doorPreview : null}
            selectedDoorId={selectedDoorId}
            onDoorSelect={id => { setSelectedDoorId(id); setSelectedWallId(null) }}
            onEndpointClick={handleWallEndpointClick}
          />
        )}

        {/* Measurements — visible to all */}
        <MapMeasureLayer
          measurements={allMeasurements}
          panX={position.x}
          panY={position.y}
          scale={scale}
          gridEnabled={map.gridEnabled}
          gridSize={map.gridSize}
        />

        {selectedToken && (isGm || allowPlayerTokenMove) && (
          <Layer x={position.x} y={position.y} scaleX={scale} scaleY={scale}>
            <SelectionHandle
              token={selectedToken}
              scale={scale}
              onResize={onTokenResize}
            />
          </Layer>
        )}
      </Stage>

      {/* Token settings HUD (GM only) */}
      {isGm && selectedToken && tokenHudPos && onTokenEdit && (
        <button
          title="Configurar token"
          onClick={() => onTokenEdit(selectedToken.id)}
          style={{
            position: 'absolute',
            left: tokenHudPos.x,
            top: tokenHudPos.y,
            transform: 'translate(-50%, calc(-100% - 6px))',
            zIndex: 20,
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.55rem',
            background: 'rgba(8,12,24,0.96)', border: '1px solid rgba(200,146,42,0.4)',
            borderRadius: 5, boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
            cursor: 'pointer',
          }}
        >
          ⚙ {selectedToken.character.name}
        </button>
      )}

      {/* Wall delete HUD */}
      {isGm && tool === 'wall' && wallHudPos && selectedWallId && (
        <div style={{
          position: 'absolute', left: wallHudPos.x, top: wallHudPos.y,
          transform: 'translate(-50%, calc(-100% - 10px))', zIndex: 20,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.5rem',
          background: 'rgba(8,12,24,0.96)', border: '1px solid rgba(232,80,48,0.45)',
          borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', userSelect: 'none' }}>
            Parede
          </span>
          <button
            title="Excluir parede"
            onClick={() => { onWallDelete?.(selectedWallId); setSelectedWallId(null) }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: 4,
              background: 'rgba(232,80,48,0.15)', border: '1px solid rgba(232,80,48,0.45)',
              color: 'rgba(232,80,48,0.9)', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            🗑
          </button>
        </div>
      )}

      {/* Door HUD */}
      {isGm && selectedDoorId && (() => {
        const door = (currentLayer?.doors ?? []).find(d => d.id === selectedDoorId)
        if (!door || door.points.length < 2) return null
        const hx = ((door.points[0].x + door.points[1].x) / 2) * scale + position.x
        const hy = ((door.points[0].y + door.points[1].y) / 2) * scale + position.y
        return (
          <div style={{
            position: 'absolute', left: hx, top: hy,
            transform: 'translate(-50%, calc(-100% - 10px))', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.5rem',
            background: 'rgba(8,12,24,0.96)', border: '1px solid rgba(200,146,42,0.45)',
            borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', userSelect: 'none' }}>
              Porta
            </span>
            <button
              title={door.isOpen ? 'Fechar porta' : 'Abrir porta'}
              onClick={() => { onDoorToggle?.(door.id); setSelectedDoorId(null) }}
              style={{
                padding: '0.2rem 0.55rem', borderRadius: 4, cursor: 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 700,
                background: door.isOpen ? 'rgba(232,80,48,0.15)' : 'rgba(111,200,146,0.15)',
                border: `1px solid ${door.isOpen ? 'rgba(232,80,48,0.5)' : 'rgba(111,200,146,0.5)'}`,
                color: door.isOpen ? 'rgba(232,80,48,0.9)' : 'rgba(111,200,146,0.9)',
              }}
            >
              {door.isOpen ? 'Fechar' : 'Abrir'}
            </button>
            {tool === 'door' && (
              <button
                title="Excluir porta"
                onClick={() => { onDoorDelete?.(door.id); setSelectedDoorId(null) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem',
                  background: 'rgba(232,80,48,0.15)', border: '1px solid rgba(232,80,48,0.45)',
                  color: 'rgba(232,80,48,0.9)',
                }}
              >
                🗑
              </button>
            )}
          </div>
        )
      })()}

      {/* Measurement hint */}
      {isMeasuring && measureStart && (
        <div style={{
          position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          padding: '0.25rem 0.65rem', borderRadius: 99,
          background: 'rgba(4,6,12,0.85)', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)',
          pointerEvents: 'none',
        }}>
          Clique para fixar · ESC para cancelar
        </div>
      )}
    </div>
  )
}
