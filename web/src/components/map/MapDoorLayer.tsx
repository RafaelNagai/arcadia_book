import { Layer, Line, Circle } from 'react-konva'
import type { MapDoor, MapTool } from '@/lib/mapTypes'

interface MapDoorLayerProps {
  doors: MapDoor[]
  panX: number
  panY: number
  scale: number
  tool: MapTool
  doorStart: { x: number; y: number } | null
  previewPoint: { x: number; y: number } | null
  selectedDoorId: string | null
  onDoorSelect: (doorId: string) => void
  onEndpointClick?: (point: { x: number; y: number }) => void
}

export function MapDoorLayer({
  doors,
  panX,
  panY,
  scale,
  tool,
  doorStart,
  previewPoint,
  selectedDoorId,
  onDoorSelect,
  onEndpointClick,
}: MapDoorLayerProps) {
  const selectedDoor = selectedDoorId ? doors.find(d => d.id === selectedDoorId) : null
  const endpoints = selectedDoor?.points.length === 2
    ? [selectedDoor.points[0], selectedDoor.points[1]]
    : []

  return (
    <Layer x={panX} y={panY} scaleX={scale} scaleY={scale}>
      {doors.map(door =>
        door.points.length === 2 ? (
          <Line
            key={door.id}
            points={door.points.flatMap(p => [p.x, p.y])}
            stroke={
              selectedDoorId === door.id
                ? 'rgba(255,210,80,1)'
                : door.isOpen
                  ? 'rgba(111,200,146,0.7)'
                  : 'rgba(200,146,42,0.9)'
            }
            strokeWidth={(selectedDoorId === door.id ? 6 : 5) / scale}
            lineCap="round"
            lineJoin="round"
            dash={door.isOpen ? [8 / scale, 5 / scale] : undefined}
            hitStrokeWidth={18 / scale}
            onClick={(e) => { e.cancelBubble = true; onDoorSelect(door.id) }}
            style={{ cursor: 'pointer' }}
          />
        ) : null
      )}

      {/* Endpoint circles for selected door — click to extend */}
      {(tool === 'wall' || tool === 'door') && endpoints.map((pt, i) => (
        <Circle
          key={`dep-${i}`}
          x={pt.x}
          y={pt.y}
          radius={8 / scale}
          fill="rgba(232,184,75,0.15)"
          stroke="rgba(232,184,75,0.95)"
          strokeWidth={2 / scale}
          hitStrokeWidth={20 / scale}
          onClick={(e) => { e.cancelBubble = true; onEndpointClick?.(pt) }}
          style={{ cursor: 'crosshair' }}
        />
      ))}

      {/* Preview segment */}
      {doorStart && previewPoint && (
        <Line
          points={[doorStart.x, doorStart.y, previewPoint.x, previewPoint.y]}
          stroke="rgba(232,184,75,0.55)"
          strokeWidth={4 / scale}
          dash={[6 / scale, 4 / scale]}
          listening={false}
        />
      )}

      {/* doorStart anchor dot */}
      {doorStart && (
        <Circle x={doorStart.x} y={doorStart.y} radius={5 / scale} fill="rgba(232,184,75,0.9)" listening={false} />
      )}
    </Layer>
  )
}
