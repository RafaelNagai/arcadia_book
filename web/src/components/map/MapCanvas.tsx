import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Group, Rect, Ring, Circle } from 'react-konva'
import type Konva from 'konva'
import type { MapLayer, MapToken, GameMap, MapTool, FogPatch } from '@/lib/mapTypes'
import { computeVisibilityPolygon } from '@/lib/fogOfWar'
import { MapTokenLayer } from './MapTokenLayer'
import { MapFogLayer } from './MapFogLayer'
import { MapWallLayer } from './MapWallLayer'

const TOKEN_BASE_RADIUS = 28

// ── SelectionHandle ───────────────────────────────────────────────────────────
// Rendered above fog + walls. Drag the edge handle to resize the token.

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
    // Constrain handle to the circle edge
    e.target.x(token.x + dist * Math.cos(angle))
    e.target.y(token.y + dist * Math.sin(angle))
    // Update ring live without React state (imperative)
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
    const newSize = dist / TOKEN_BASE_RADIUS
    onResize?.(token.id, newSize)
  }, [token.x, token.y, token.id, onResize])

  return (
    <>
      {/* Selection ring */}
      <Ring
        ref={ringRef}
        x={token.x}
        y={token.y}
        innerRadius={r}
        outerRadius={r + 3 / scale}
        fill="rgba(200,146,42,0.65)"
        listening={false}
      />
      {/* Resize handle at the right edge */}
      <Circle
        ref={handleRef}
        x={token.x + r}
        y={token.y}
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
  activeLayer: MapLayer | null
  tokens: MapToken[]
  tool: MapTool
  isGm: boolean
  containerWidth: number
  containerHeight: number
  fogEnabled: boolean
  myCharacterIds: string[]
  npcCharacterIds: string[]
  dragOverride: { tokenId: string; x: number; y: number } | null
  localFogPatches: FogPatch[]
  onTokenDrag?: (tokenId: string, x: number, y: number) => void
  onTokenMove?: (tokenId: string, x: number, y: number) => void
  onTokenResize?: (tokenId: string, size: number) => void
  onTokenEdit?: (tokenId: string) => void
  onTokenDrop?: (charId: string, worldX: number, worldY: number, visionRadius: number | null) => void
  onFogReveal?: (patch: FogPatch) => void
  onWallAdd?: (points: Array<{ x: number; y: number }>) => void
  onWallDelete?: (wallId: string) => void
}

// Walk the Konva node tree to check if any ancestor is draggable
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
  activeLayer,
  tokens,
  tool,
  isGm,
  containerWidth,
  containerHeight,
  fogEnabled,
  myCharacterIds,
  npcCharacterIds,
  dragOverride,
  localFogPatches,
  onTokenDrag,
  onTokenMove,
  onTokenResize,
  onTokenEdit,
  onTokenDrop,
  onFogReveal,
  onWallAdd,
  onWallDelete,
}: MapCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const stateRef = useRef({ scale, position })
  stateRef.current = { scale, position }

  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

  // Wall editor state: A→B single segment
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null)
  const [wallPreview, setWallPreview] = useState<{ x: number; y: number } | null>(null)
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)

  // Selected token for resize handle
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)

  // ESC cancels current wall or deselects
  useEffect(() => {
    if (tool !== 'wall') {
      setWallStart(null); setWallPreview(null); setSelectedWallId(null)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setWallStart(null); setSelectedWallId(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tool])

  useEffect(() => { setSelectedTokenId(null) }, [tool])

  // Load background image when active layer changes
  useEffect(() => {
    if (!activeLayer) { setBgImage(null); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = activeLayer.imageUrl
    img.onload = () => setBgImage(img)
    img.onerror = () => setBgImage(null)
    return () => { img.onload = null; img.onerror = null }
  }, [activeLayer?.id, activeLayer?.imageUrl])

  // Fit image to container on first load
  useEffect(() => {
    if (!bgImage || containerWidth === 0 || containerHeight === 0) return
    const fit = Math.min(containerWidth / bgImage.naturalWidth, containerHeight / bgImage.naturalHeight)
    setScale(fit)
    setPosition({
      x: (containerWidth - bgImage.naturalWidth * fit) / 2,
      y: (containerHeight - bgImage.naturalHeight * fit) / 2,
    })
  }, [bgImage, containerWidth, containerHeight])

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
    if (tool === 'wall' && isGm) {
      const wp = getWorldPos()
      if (wp) setWallPreview(wp)
    }
  }, [tool, isGm, getWorldPos])

  const handleMouseUp = useCallback(() => { isPanning.current = false }, [])

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
    if (tool !== 'wall' || !isGm) return
    // If a wall is selected, clicking outside just deselects — don't start construction
    if (selectedWallId !== null) {
      setSelectedWallId(null)
      return
    }
    const wp = getWorldPos()
    if (!wp) return
    if (!wallStart) {
      setWallStart(wp)
    } else {
      onWallAdd?.([wallStart, wp])
      setWallStart(null)
    }
  }, [tool, isGm, wallStart, selectedWallId, onWallAdd, getWorldPos])

  const handleWallEndpointClick = useCallback((point: { x: number; y: number }) => {
    setSelectedWallId(null)
    setWallStart(point)
  }, [])

  // Vision circles: only player's OWN tokens (non-NPC) generate vision
  // This prevents NPC tokens from clearing fog for players
  const visionCircles: FogPatch[] = tokens
    .filter(t =>
      t.layerId === activeLayer?.id &&
      !npcCharacterIds.includes(t.characterId) &&
      (isGm || myCharacterIds.includes(t.characterId)),
    )
    .map(t => {
      const pos = dragOverride?.tokenId === t.id
        ? { x: dragOverride.x, y: dragOverride.y }
        : { x: t.x, y: t.y }
      return { ...pos, radius: t.visionRadius ?? map.defaultVisionRadius }
    })

  const walls = activeLayer?.walls ?? []
  const visionPolygons = fogEnabled
    ? visionCircles.map(c => computeVisibilityPolygon({ x: c.x, y: c.y }, c.radius, walls))
    : []

  // Wall delete HUD position
  const selectedWall = walls.find(w => w.id === selectedWallId)
  const wallHudPos = selectedWall && selectedWall.points.length >= 2 ? {
    x: ((selectedWall.points[0].x + selectedWall.points[1].x) / 2) * scale + position.x,
    y: ((selectedWall.points[0].y + selectedWall.points[1].y) / 2) * scale + position.y,
  } : null

  const selectedToken = selectedTokenId ? tokens.find(t => t.id === selectedTokenId) : null

  // Screen-space position of selected token (for HTML overlay)
  const tokenHudPos = selectedToken ? {
    x: selectedToken.x * scale + position.x,
    y: (selectedToken.y - TOKEN_BASE_RADIUS * (selectedToken.size ?? 1)) * scale + position.y,
  } : null

  const stageW = containerWidth || window.innerWidth
  const stageH = containerHeight || window.innerHeight

  const cursorStyle = tool === 'fog' || tool === 'wall' ? 'crosshair' : 'grab'

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
        onClick={handleClick}
        style={{ background: '#04060C', cursor: cursorStyle }}
      >
        {/* Background + grid */}
        <Layer>
          <Group x={position.x} y={position.y} scaleX={scale} scaleY={scale}>
            {bgImage ? (
              <KonvaImage image={bgImage} width={bgImage.naturalWidth} height={bgImage.naturalHeight} />
            ) : (
              <Rect width={stageW} height={stageH} fill="#0A0F1E" />
            )}
            {map.gridEnabled && bgImage && (
              <>
                {Array.from({ length: Math.ceil(bgImage.naturalWidth / map.gridSize) + 1 }, (_, i) => (
                  <Line key={`vl${i}`} points={[i * map.gridSize, 0, i * map.gridSize, bgImage.naturalHeight]} stroke="rgba(255,255,255,0.12)" strokeWidth={1 / scale} />
                ))}
                {Array.from({ length: Math.ceil(bgImage.naturalHeight / map.gridSize) + 1 }, (_, i) => (
                  <Line key={`hl${i}`} points={[0, i * map.gridSize, bgImage.naturalWidth, i * map.gridSize]} stroke="rgba(255,255,255,0.12)" strokeWidth={1 / scale} />
                ))}
              </>
            )}
          </Group>
        </Layer>

        {/* Tokens */}
        <MapTokenLayer
          tokens={tokens}
          activeLayerId={activeLayer?.id ?? null}
          tool={tool}
          isGm={isGm}
          scale={scale}
          panX={position.x}
          panY={position.y}
          fogEnabled={fogEnabled}
          visionPolygons={visionPolygons}
          myCharacterIds={myCharacterIds}
          onTokenDrag={onTokenDrag}
          onTokenMove={onTokenMove}
          onTokenClick={setSelectedTokenId}
        />

        {/* Fog of war (above tokens) */}
        {fogEnabled && (
          <MapFogLayer
            enabled={fogEnabled}
            panX={position.x}
            panY={position.y}
            scale={scale}
            visionPolygons={visionPolygons}
            revealedPatches={[...(activeLayer?.fogRevealed ?? []), ...localFogPatches]}
          />
        )}

        {/* Walls — visible only to GM */}
        {isGm && (
          <MapWallLayer
            walls={activeLayer?.walls ?? []}
            panX={position.x}
            panY={position.y}
            scale={scale}
            wallStart={wallStart}
            previewPoint={tool === 'wall' ? wallPreview : null}
            selectedWallId={selectedWallId}
            onWallSelect={setSelectedWallId}
            onWallEndpointClick={handleWallEndpointClick}
          />
        )}

        {/* Selection + resize handle (above fog and walls) */}
        {selectedToken && (
          <Layer x={position.x} y={position.y} scaleX={scale} scaleY={scale}>
            <SelectionHandle
              token={selectedToken}
              scale={scale}
              onResize={onTokenResize}
            />
          </Layer>
        )}
      </Stage>

      {/* Token settings HUD (GM only, HTML overlay) */}
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

      {/* Wall delete HUD (HTML overlay) */}
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
    </div>
  )
}
