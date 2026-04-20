import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Group, Rect } from 'react-konva'
import type Konva from 'konva'
import type { MapLayer, MapToken, GameMap, MapTool } from '@/lib/mapTypes'
import { MapTokenLayer } from './MapTokenLayer'

interface MapCanvasProps {
  map: GameMap
  activeLayer: MapLayer | null
  tokens: MapToken[]
  tool: MapTool
  isGm: boolean
  containerWidth: number
  containerHeight: number
  onTokenDrag?: (tokenId: string, x: number, y: number) => void
  onTokenMove?: (tokenId: string, x: number, y: number) => void
}

export function MapCanvas({
  map,
  activeLayer,
  tokens,
  tool,
  isGm,
  containerWidth,
  containerHeight,
  onTokenDrag,
  onTokenMove,
}: MapCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Keep latest values in a ref so wheel/pan handlers don't go stale
  const stateRef = useRef({ scale, position })
  stateRef.current = { scale, position }

  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

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
    const fit = Math.min(
      containerWidth / bgImage.naturalWidth,
      containerHeight / bgImage.naturalHeight,
    )
    setScale(fit)
    setPosition({
      x: (containerWidth - bgImage.naturalWidth * fit) / 2,
      y: (containerHeight - bgImage.naturalHeight * fit) / 2,
    })
  }, [bgImage, containerWidth, containerHeight])

  // Pointer-centered zoom via scroll wheel
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

  // Pan via mouse drag (tool === 'select')
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== 'select') return
    isPanning.current = true
    lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
  }, [tool])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning.current) return
    const dx = e.evt.clientX - lastPan.current.x
    const dy = e.evt.clientY - lastPan.current.y
    lastPan.current = { x: e.evt.clientX, y: e.evt.clientY }
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
  }, [])

  const handleMouseUp = useCallback(() => { isPanning.current = false }, [])

  const stageW = containerWidth || window.innerWidth
  const stageH = containerHeight || window.innerHeight

  return (
    <Stage
      ref={stageRef}
      width={stageW}
      height={stageH}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ background: '#04060C', cursor: tool === 'select' ? 'grab' : 'crosshair' }}
    >
      {/* Background + grid — pan/zoom via Group */}
      <Layer>
        <Group x={position.x} y={position.y} scaleX={scale} scaleY={scale}>
          {bgImage ? (
            <KonvaImage
              image={bgImage}
              width={bgImage.naturalWidth}
              height={bgImage.naturalHeight}
            />
          ) : (
            <Rect width={stageW} height={stageH} fill="#0A0F1E" />
          )}

          {map.gridEnabled && bgImage && (
            <>
              {Array.from({ length: Math.ceil(bgImage.naturalWidth / map.gridSize) + 1 }, (_, i) => (
                <Line
                  key={`vl${i}`}
                  points={[i * map.gridSize, 0, i * map.gridSize, bgImage.naturalHeight]}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={1 / scale}
                />
              ))}
              {Array.from({ length: Math.ceil(bgImage.naturalHeight / map.gridSize) + 1 }, (_, i) => (
                <Line
                  key={`hl${i}`}
                  points={[0, i * map.gridSize, bgImage.naturalWidth, i * map.gridSize]}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={1 / scale}
                />
              ))}
            </>
          )}
        </Group>
      </Layer>

      {/* Token layer — same pan/zoom applied to the Layer directly */}
      <MapTokenLayer
        tokens={tokens}
        activeLayerId={activeLayer?.id ?? null}
        tool={tool}
        isGm={isGm}
        scale={scale}
        panX={position.x}
        panY={position.y}
        onTokenDrag={onTokenDrag}
        onTokenMove={onTokenMove}
      />
    </Stage>
  )
}
