import { Layer, Line, Circle } from 'react-konva'
import type { MapWall } from '@/lib/mapTypes'

interface MapWallLayerProps {
  walls: MapWall[]
  panX: number
  panY: number
  scale: number
  wallStart: { x: number; y: number } | null
  previewPoint: { x: number; y: number } | null
  selectedWallId: string | null
  onWallSelect: (wallId: string) => void
}

export function MapWallLayer({
  walls,
  panX,
  panY,
  scale,
  wallStart,
  previewPoint,
  selectedWallId,
  onWallSelect,
}: MapWallLayerProps) {
  return (
    <Layer x={panX} y={panY} scaleX={scale} scaleY={scale}>
      {/* Saved walls — click to select */}
      {walls.map(wall =>
        wall.points.length >= 2 ? (
          <Line
            key={wall.id}
            points={wall.points.flatMap(p => [p.x, p.y])}
            stroke={selectedWallId === wall.id ? 'rgba(255,120,80,0.95)' : 'rgba(232,80,48,0.85)'}
            strokeWidth={(selectedWallId === wall.id ? 4 : 3) / scale}
            lineCap="round"
            lineJoin="round"
            hitStrokeWidth={16 / scale}
            onClick={(e) => { e.cancelBubble = true; onWallSelect(wall.id) }}
            style={{ cursor: 'pointer' }}
          />
        ) : null
      )}

      {/* Preview segment from wallStart to cursor */}
      {wallStart && previewPoint && (
        <Line
          points={[wallStart.x, wallStart.y, previewPoint.x, previewPoint.y]}
          stroke="rgba(232,184,75,0.55)"
          strokeWidth={2 / scale}
          dash={[6 / scale, 4 / scale]}
          listening={false}
        />
      )}

      {/* wallStart anchor dot */}
      {wallStart && (
        <Circle x={wallStart.x} y={wallStart.y} radius={5 / scale} fill="rgba(232,184,75,0.9)" listening={false} />
      )}
    </Layer>
  )
}
