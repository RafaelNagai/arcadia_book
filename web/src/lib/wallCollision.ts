type Point = { x: number; y: number }
export type WallSegment = { a: Point; b: Point }

// Parametric intersection of segment p1→p2 against segment p3→p4.
// Returns t ∈ (0, 1] (along p1→p2) or null if no intersection.
function segmentCrossT(p1: Point, p2: Point, p3: Point, p4: Point): number | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y
  const denom = d1x * d2y - d1y * d2x
  if (Math.abs(denom) < 1e-10) return null // parallel
  const dx = p3.x - p1.x, dy = p3.y - p1.y
  const t = (dx * d2y - dy * d2x) / denom
  const u = (dx * d1y - dy * d1x) / denom
  // t > small epsilon so we don't re-detect the wall we're already touching
  if (t > 0.002 && t <= 1 && u >= 0 && u <= 1) return t
  return null
}

// Closest point on segment to p, and the distance.
function closestOnSegment(p: Point, a: Point, b: Point): { closest: Point; dist: number } {
  const ax = b.x - a.x, ay = b.y - a.y
  const len2 = ax * ax + ay * ay
  if (len2 < 1e-10) return { closest: a, dist: Math.hypot(p.x - a.x, p.y - a.y) }
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * ax + (p.y - a.y) * ay) / len2))
  const closest = { x: a.x + t * ax, y: a.y + t * ay }
  return { closest, dist: Math.hypot(p.x - closest.x, p.y - closest.y) }
}

/**
 * Constrains movement from `from` to `to` so the circle of radius `tokenRadius`
 * cannot cross any wall segment. Returns the farthest reachable position with sliding.
 *
 * Algorithm:
 *   1. Find the earliest wall crossing along the movement segment.
 *   2. Stop just before the crossing; push the center tokenRadius away from the wall.
 *   3. Project remaining movement onto the wall direction (slide).
 *   4. Repeat up to maxIterations (handles corners).
 */
export function constrainToWalls(
  from: Point,
  to: Point,
  walls: WallSegment[],
  tokenRadius = 28,
  maxIterations = 3,
): Point {
  if (walls.length === 0) return to

  let pos = { ...from }
  let delta = { x: to.x - from.x, y: to.y - from.y }

  for (let iter = 0; iter < maxIterations; iter++) {
    const len = Math.hypot(delta.x, delta.y)
    if (len < 0.5) break

    const target = { x: pos.x + delta.x, y: pos.y + delta.y }

    let earliestT = 1
    let hitWall: WallSegment | null = null

    for (const wall of walls) {
      const t = segmentCrossT(pos, target, wall.a, wall.b)
      if (t !== null && t < earliestT) {
        earliestT = t
        hitWall = wall
      }
    }

    if (!hitWall) {
      // No collision — move freely
      pos = target
      break
    }

    // Move to just before the crossing (1px buffer)
    const safeT = Math.max(0, earliestT - 1 / len)
    pos = { x: pos.x + delta.x * safeT, y: pos.y + delta.y * safeT }

    // Push center away from the wall by tokenRadius so it doesn't overlap
    const { closest, dist } = closestOnSegment(pos, hitWall.a, hitWall.b)
    if (dist < tokenRadius && dist > 0.001) {
      const pushScale = (tokenRadius - dist) / dist
      pos = {
        x: pos.x + (pos.x - closest.x) * pushScale,
        y: pos.y + (pos.y - closest.y) * pushScale,
      }
    }

    // Slide: project remaining movement onto wall direction
    const wdx = hitWall.b.x - hitWall.a.x
    const wdy = hitWall.b.y - hitWall.a.y
    const wlen = Math.hypot(wdx, wdy)
    if (wlen < 0.01) break
    const wx = wdx / wlen, wy = wdy / wlen
    const remainScale = 1 - safeT
    const dot = (delta.x * remainScale) * wx + (delta.y * remainScale) * wy
    delta = { x: dot * wx, y: dot * wy }
  }

  return pos
}

/** Converts a map wall/door (array of points) into individual WallSegments. */
export function pointsToSegments(points: Point[]): WallSegment[] {
  const segs: WallSegment[] = []
  for (let i = 0; i < points.length - 1; i++) {
    segs.push({ a: points[i], b: points[i + 1] })
  }
  return segs
}
