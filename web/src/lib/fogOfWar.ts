export interface WallPoint { x: number; y: number }

export function isInsidePolygon(x: number, y: number, polygon: WallPoint[]): boolean {
  if (polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function isInsideAnyPolygon(x: number, y: number, polygons: WallPoint[][]): boolean {
  return polygons.some(p => isInsidePolygon(x, y, p))
}
export interface WallData { points: WallPoint[] }

function castRay(
  ox: number, oy: number,
  cosA: number, sinA: number,
  maxDist: number,
  walls: WallData[],
): number {
  let tMin = maxDist
  for (const wall of walls) {
    const pts = wall.points
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = pts[i].x,  ay = pts[i].y
      const bx = pts[i + 1].x, by = pts[i + 1].y
      const wx = bx - ax, wy = by - ay
      const dax = ax - ox, day = ay - oy
      const D = cosA * wy - sinA * wx
      if (Math.abs(D) < 1e-10) continue
      const t = (dax * wy - day * wx) / D
      const s = (dax * sinA - day * cosA) / D
      if (t > 1e-6 && t < tMin && s >= 0 && s <= 1) tMin = t
    }
  }
  return tMin
}

// Computes the visibility polygon for a token at `origin` with given `radius`.
// Cast rays at every wall endpoint (±ε for accurate corners) plus evenly-spaced
// fill rays so arcs are smooth between walls.
export function computeVisibilityPolygon(
  origin: WallPoint,
  radius: number,
  walls: WallData[],
  fillSteps = 180,
): WallPoint[] {
  const angles: number[] = []
  const EPS = 0.0005

  // Rays toward each wall endpoint for accurate corners
  for (const wall of walls) {
    for (const pt of wall.points) {
      const a = Math.atan2(pt.y - origin.y, pt.x - origin.x)
      angles.push(a - EPS, a, a + EPS)
    }
  }

  // Evenly-spaced fill rays for smooth circular arcs
  for (let i = 0; i < fillSteps; i++) {
    angles.push((i / fillSteps) * Math.PI * 2 - Math.PI)
  }

  angles.sort((a, b) => a - b)

  const out: WallPoint[] = []
  for (const angle of angles) {
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const t = castRay(origin.x, origin.y, cosA, sinA, radius, walls)
    out.push({ x: origin.x + t * cosA, y: origin.y + t * sinA })
  }
  return out
}
