import { Layer, Line, Circle, Text, Group } from 'react-konva'
import type { Measurement } from '@/lib/mapTypes'

interface Props {
  measurements: Measurement[]
  panX: number
  panY: number
  scale: number
  gridEnabled?: boolean
  gridSize?: number
}

function distPx(m: Measurement): number {
  return Math.sqrt((m.x2 - m.x1) ** 2 + (m.y2 - m.y1) ** 2)
}

const DEFAULT_BLOCK_PX = 100

function label(m: Measurement, gridEnabled: boolean, gridSize: number): string {
  const px = Math.round(distPx(m))
  const blockSize = gridEnabled && gridSize > 0 ? gridSize : DEFAULT_BLOCK_PX
  const blocks = (px / blockSize).toFixed(1)
  return `${blocks} bl`
}

function MeasurementShape({ m, scale, gridEnabled, gridSize }: {
  m: Measurement
  scale: number
  gridEnabled: boolean
  gridSize: number
}) {
  const dash = m.isLive ? [8 / scale, 4 / scale] : undefined
  const alpha = m.isLive ? 0.7 : 0.9
  const strokeW = 2 / scale
  const lbl = label(m, gridEnabled, gridSize)

  if (m.type === 'ruler') {
    const mx = (m.x1 + m.x2) / 2
    const my = (m.y1 + m.y2) / 2
    return (
      <Group>
        {/* start dot */}
        <Circle x={m.x1} y={m.y1} radius={4 / scale} fill={m.color} opacity={alpha} listening={false} />
        {/* line */}
        <Line
          points={[m.x1, m.y1, m.x2, m.y2]}
          stroke={m.color}
          strokeWidth={strokeW}
          opacity={alpha}
          dash={dash}
          listening={false}
        />
        {/* end dot */}
        <Circle x={m.x2} y={m.y2} radius={4 / scale} fill={m.color} opacity={alpha} listening={false} />
        {/* label */}
        <Text
          x={mx}
          y={my - 14 / scale}
          text={lbl}
          fontSize={11 / scale}
          fill={m.color}
          opacity={alpha}
          offsetX={lbl.length * 3 / scale}
          listening={false}
          shadowColor="black"
          shadowBlur={3 / scale}
          shadowOpacity={0.8}
        />
      </Group>
    )
  }

  // circle mode
  const radius = distPx(m)
  const radiusLabel = label(m, gridEnabled, gridSize)
  return (
    <Group>
      <Circle
        x={m.x1} y={m.y1}
        radius={radius}
        stroke={m.color}
        strokeWidth={strokeW}
        opacity={alpha}
        dash={dash}
        fill={`${m.color}15`}
        listening={false}
      />
      <Circle x={m.x1} y={m.y1} radius={4 / scale} fill={m.color} opacity={alpha} listening={false} />
      {/* radius line */}
      <Line
        points={[m.x1, m.y1, m.x2, m.y2]}
        stroke={m.color}
        strokeWidth={strokeW * 0.6}
        opacity={alpha * 0.5}
        dash={[5 / scale, 3 / scale]}
        listening={false}
      />
      <Text
        x={m.x1}
        y={m.y1 - radius - 16 / scale}
        text={radiusLabel}
        fontSize={11 / scale}
        fill={m.color}
        opacity={alpha}
        offsetX={radiusLabel.length * 3 / scale}
        listening={false}
        shadowColor="black"
        shadowBlur={3 / scale}
        shadowOpacity={0.8}
      />
    </Group>
  )
}

export function MapMeasureLayer({ measurements, panX, panY, scale, gridEnabled = false, gridSize = 64 }: Props) {
  if (measurements.length === 0) return null
  return (
    <Layer listening={false}>
      <Group x={panX} y={panY} scaleX={scale} scaleY={scale}>
        {measurements.map(m => (
          <MeasurementShape key={m.id} m={m} scale={scale} gridEnabled={gridEnabled} gridSize={gridSize} />
        ))}
      </Group>
    </Layer>
  )
}
