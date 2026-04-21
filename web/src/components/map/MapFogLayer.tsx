import { Layer, Rect, Circle, Shape } from 'react-konva'
import type { FogPatch } from '@/lib/mapTypes'

interface MapFogLayerProps {
  enabled: boolean
  panX: number
  panY: number
  scale: number
  visionPolygons: Array<Array<{ x: number; y: number }>>
  revealedPatches: FogPatch[]
}

function PolygonHole({ poly }: { poly: Array<{ x: number; y: number }> }) {
  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        if (poly.length < 3) return
        ctx.beginPath()
        ctx.moveTo(poly[0].x, poly[0].y)
        for (let j = 1; j < poly.length; j++) ctx.lineTo(poly[j].x, poly[j].y)
        ctx.closePath()
        ctx.fillShape(shape)
      }}
      fill="black"
      globalCompositeOperation="destination-out"
    />
  )
}

export function MapFogLayer({
  enabled,
  panX,
  panY,
  scale,
  visionPolygons,
  revealedPatches,
}: MapFogLayerProps) {
  if (!enabled) return null

  return (
    <>
      {/* Dark fog: holes for current vision + all explored patches */}
      <Layer x={panX} y={panY} scaleX={scale} scaleY={scale} listening={false}>
        <Rect x={-50000} y={-50000} width={100000} height={100000} fill="rgba(0,0,0,0.92)" />

        {visionPolygons.map((poly, i) => (
          <PolygonHole key={`dv${i}`} poly={poly} />
        ))}

        {revealedPatches.map((c, i) =>
          c.polygon ? (
            <PolygonHole key={`dr${i}`} poly={c.polygon} />
          ) : (
            <Circle
              key={`dr${i}`}
              x={c.x} y={c.y} radius={c.radius}
              fillRadialGradientStartPoint={{ x: 0, y: 0 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={c.radius}
              fillRadialGradientColorStops={[0, 'rgba(0,0,0,1)', 0.72, 'rgba(0,0,0,1)', 1, 'rgba(0,0,0,0)']}
              globalCompositeOperation="destination-out"
            />
          )
        )}
      </Layer>

      {/* Memory fog: dims explored areas outside current vision */}
      <Layer x={panX} y={panY} scaleX={scale} scaleY={scale} listening={false}>
        <Rect x={-50000} y={-50000} width={100000} height={100000} fill="rgba(4,6,20,0.65)" />
        {visionPolygons.map((poly, i) => (
          <PolygonHole key={`mv${i}`} poly={poly} />
        ))}
      </Layer>
    </>
  )
}
