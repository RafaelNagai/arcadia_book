import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Rect } from 'react-konva'
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
  onTokenMove,
}: MapCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

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
    const scaleX = containerWidth / bgImage.naturalWidth
    const scaleY = containerHeight / bgImage.naturalHeight
    const fit = Math.min(scaleX, scaleY, 1)
    setScale(fit)
    setPosition({
      x: (containerWidth - bgImage.naturalWidth * fit) / 2,
      y: (containerHeight - bgImage.naturalHeight * fit) / 2,
    })
  }, [bgImage, containerWidth, containerHeight])

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const zoomFactor = e.evt.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.max(0.1, Math.min(8, oldScale * zoomFactor))

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    setScale(newScale)
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [scale, position])

  const isDraggingStage = tool === 'select'

  return (
    <Stage
      ref={stageRef}
      width={containerWidth}
      height={containerHeight}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      draggable={isDraggingStage}
      onDragEnd={e => setPosition({ x: e.target.x(), y: e.target.y() })}
      onWheel={handleWheel}
      style={{ background: '#04060C', cursor: isDraggingStage ? 'grab' : 'crosshair' }}
    >
      {/* Background image layer */}
      <Layer>
        {bgImage && (
          <KonvaImage
            image={bgImage}
            width={bgImage.naturalWidth}
            height={bgImage.naturalHeight}
          />
        )}
        {!bgImage && activeLayer && (
          <Rect
            width={800}
            height={600}
            fill="#0A0F1E"
          />
        )}
      </Layer>

      {/* Grid layer */}
      {map.gridEnabled && bgImage && (
        <Layer listening={false}>
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
        </Layer>
      )}

      {/* Token layer */}
      <MapTokenLayer
        tokens={tokens}
        activeLayerId={activeLayer?.id ?? null}
        tool={tool}
        isGm={isGm}
        scale={scale}
        onTokenMove={onTokenMove}
      />
    </Stage>
  )
}
