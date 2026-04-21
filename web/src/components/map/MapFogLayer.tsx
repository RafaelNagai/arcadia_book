import { Layer, Rect, Circle } from 'react-konva'
import type { FogPatch } from '@/lib/mapTypes'

interface MapFogLayerProps {
  enabled: boolean
  panX: number
  panY: number
  scale: number
  visionCircles: FogPatch[]
  revealedPatches: FogPatch[]
}

function fogHole(c: FogPatch, key: string) {
  return (
    <Circle
      key={key}
      x={c.x}
      y={c.y}
      radius={c.radius}
      fillRadialGradientStartPoint={{ x: 0, y: 0 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndPoint={{ x: 0, y: 0 }}
      fillRadialGradientEndRadius={c.radius}
      fillRadialGradientColorStops={[0, 'rgba(0,0,0,1)', 0.72, 'rgba(0,0,0,1)', 1, 'rgba(0,0,0,0)']}
      globalCompositeOperation="destination-out"
    />
  )
}

export function MapFogLayer({
  enabled,
  panX,
  panY,
  scale,
  visionCircles,
  revealedPatches,
}: MapFogLayerProps) {
  if (!enabled) return null

  const allRevealed = [...visionCircles, ...revealedPatches]

  return (
    <>
      {/* Dark fog: fully hides unexplored areas */}
      <Layer x={panX} y={panY} scaleX={scale} scaleY={scale} listening={false}>
        <Rect x={-50000} y={-50000} width={100000} height={100000} fill="rgba(0,0,0,0.92)" />
        {allRevealed.map((c, i) => fogHole(c, `d${i}`))}
      </Layer>

      {/* Memory fog: dims explored areas not in current vision */}
      <Layer x={panX} y={panY} scaleX={scale} scaleY={scale} listening={false}>
        <Rect x={-50000} y={-50000} width={100000} height={100000} fill="rgba(4,6,20,0.65)" />
        {visionCircles.map((c, i) => fogHole(c, `m${i}`))}
      </Layer>
    </>
  )
}
