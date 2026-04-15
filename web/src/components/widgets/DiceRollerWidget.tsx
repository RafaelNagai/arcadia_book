import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider, ConvexHullCollider } from '@react-three/rapier'
import { createPortal } from 'react-dom'
import { useState, useRef, useMemo, useCallback, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

/* ════════════════════════════════════════════════════════════════
   TEXTURE HELPERS
   ════════════════════════════════════════════════════════════════ */

const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[.50,.50]],
  2: [[.30,.30],[.70,.70]],
  3: [[.30,.30],[.50,.50],[.70,.70]],
  4: [[.30,.28],[.70,.28],[.30,.72],[.70,.72]],
  5: [[.30,.28],[.70,.28],[.50,.50],[.30,.72],[.70,.72]],
  6: [[.30,.20],[.70,.20],[.30,.50],[.70,.50],[.30,.80],[.70,.80]],
}

function makePipTex(pips: number, color: string): THREE.CanvasTexture {
  const N = 512
  const cv = document.createElement('canvas')
  cv.width = cv.height = N
  const c = cv.getContext('2d')!

  c.fillStyle = '#0e1520'
  c.fillRect(0, 0, N, N)

  const glow = c.createRadialGradient(N/2, N/2, N*.06, N/2, N/2, N*.52)
  glow.addColorStop(0, color + '18')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = glow
  c.fillRect(0, 0, N, N)

  c.strokeStyle = color + '70'
  c.lineWidth = 12
  c.lineJoin = 'round'
  c.beginPath()
  c.roundRect(10, 10, N-20, N-20, 64)
  c.stroke()

  const R = N * 0.09
  for (const [u, v] of PIP_POSITIONS[pips] ?? []) {
    const x = u * N, y = v * N
    const gr = c.createRadialGradient(x - R*.25, y - R*.25, R*.05, x, y, R)
    gr.addColorStop(0, '#fffbe0')
    gr.addColorStop(0.45, color)
    gr.addColorStop(1, '#4a3010')
    c.fillStyle = gr
    c.shadowColor = color
    c.shadowBlur = 18
    c.beginPath()
    c.arc(x, y, R, 0, Math.PI * 2)
    c.fill()
    c.shadowBlur = 0
  }
  return new THREE.CanvasTexture(cv)
}

function makeNumberTex(num: number, color: string, scale = 1.0): THREE.CanvasTexture {
  const N = 512
  const cv = document.createElement('canvas')
  cv.width = cv.height = N
  const c = cv.getContext('2d')!

  c.fillStyle = '#0e1520'
  c.fillRect(0, 0, N, N)

  const glow = c.createRadialGradient(N/2, N/2, N*.06, N/2, N/2, N*.52)
  glow.addColorStop(0, color + '18')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = glow
  c.fillRect(0, 0, N, N)

  c.strokeStyle = color + '70'
  c.lineWidth = 12
  c.lineJoin = 'round'
  c.beginPath()
  c.roundRect(10, 10, N-20, N-20, 64)
  c.stroke()

  c.fillStyle = color
  c.shadowColor = color
  c.shadowBlur = 45
  const base = num >= 10 ? 240 : 300
  c.font = `bold ${Math.round(base * scale)}px Cinzel, Georgia, serif`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(String(num), N / 2, N / 2 + 10)
  return new THREE.CanvasTexture(cv)
}

/* ════════════════════════════════════════════════════════════════
   GEOMETRY HELPERS
   ════════════════════════════════════════════════════════════════ */

/**
 * THE FIX: PolyhedronGeometry uses spherical UV projection — each face
 * sees only a thin slice of the texture, not the full number/pip image.
 *
 * This function replaces those UVs with flat per-face projection:
 *   1. For each face group, compute the centroid and face-plane normal.
 *   2. Build a local 2D tangent frame in that plane.
 *   3. Project every vertex onto the plane (relative to centroid).
 *   4. Scale so the farthest vertex lands at UV radius 0.45 from (0.5,0.5).
 *
 * Result: every face shows the full texture, number centred at UV(0.5,0.5).
 * Only call this on non-indexed geometries (PolyhedronGeometry family).
 */
function assignFlatUVs(geo: THREE.BufferGeometry, faceCount: number): void {
  const pos     = geo.attributes.position
  const total   = pos.count
  const groupSz = Math.floor(total / faceCount)
  const uvBuf   = new Float32Array(total * 2)

  // Reuse vectors to avoid GC pressure
  const va  = new THREE.Vector3()
  const vb  = new THREE.Vector3()
  const vc  = new THREE.Vector3()
  const cen = new THREE.Vector3()
  const nor = new THREE.Vector3()
  const tan = new THREE.Vector3()
  const bit = new THREE.Vector3()
  const dv  = new THREE.Vector3()
  const UP  = new THREE.Vector3(0, 1, 0)

  for (let f = 0; f < faceCount; f++) {
    const s = f * groupSz

    // 1. Centroid of this face group
    cen.set(0, 0, 0)
    for (let i = s; i < s + groupSz; i++) {
      va.fromBufferAttribute(pos, i)
      cen.add(va)
    }
    cen.divideScalar(groupSz)

    // 2. Face normal from first triangle
    va.fromBufferAttribute(pos, s)
    vb.fromBufferAttribute(pos, s + 1)
    vc.fromBufferAttribute(pos, s + 2)
    nor.crossVectors(vb.clone().sub(va), vc.clone().sub(va)).normalize()
    if (nor.dot(cen) < 0) nor.negate()   // ensure outward-facing

    // 3. Tangent = world-up projected onto face plane (fallback to X)
    tan.copy(UP).sub(nor.clone().multiplyScalar(nor.dot(UP)))
    if (tan.lengthSq() < 0.001) {
      tan.set(1, 0, 0).sub(nor.clone().multiplyScalar(nor.x))
    }
    tan.normalize()
    bit.crossVectors(nor, tan).normalize()

    // 4. Project vertices, find max radius, assign UVs
    const proj: [number, number][] = []
    for (let i = s; i < s + groupSz; i++) {
      va.fromBufferAttribute(pos, i)
      dv.subVectors(va, cen)
      proj.push([dv.dot(tan), dv.dot(bit)])
    }
    const maxR = Math.max(...proj.map(p => Math.hypot(p[0], p[1]))) || 1
    const k    = 0.45 / maxR   // scale so max vertex → UV radius 0.45

    for (let i = 0; i < proj.length; i++) {
      uvBuf[(s + i) * 2]     = 0.5 + proj[i][0] * k
      uvBuf[(s + i) * 2 + 1] = 0.5 + proj[i][1] * k
    }
  }

  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvBuf, 2))
}

/**
 * Prepares a PolyhedronGeometry for per-face texturing:
 * fixes UVs with flat projection, then adds material groups.
 * Do NOT call this on BoxGeometry (D6) — it already has correct UVs.
 */
function buildPolyGeo(geo: THREE.BufferGeometry, faceCount: number): THREE.BufferGeometry {
  assignFlatUVs(geo, faceCount)
  geo.clearGroups()
  const perFace = Math.floor(geo.attributes.position.count / faceCount)
  for (let i = 0; i < faceCount; i++) {
    geo.addGroup(i * perFace, perFace, i)
  }
  return geo
}

/** Pentagonal trapezohedron — the true D10 shape (12 vertices, 10 kite faces) */
function makeD10Geo(): THREE.BufferGeometry {
  const n      = 5
  const h_pole =  0.62  // height of top/bottom poles
  const h_up   =  0.20  // height of upper equatorial ring
  const h_dn   = -0.20  // height of lower equatorial ring
  const r      =  0.52  // radius of both equatorial rings

  const T = new THREE.Vector3(0, h_pole, 0)
  const B = new THREE.Vector3(0, -h_pole, 0)

  const U = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * r, h_up, Math.sin(a) * r)
  })
  const L = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.PI / n
    return new THREE.Vector3(Math.cos(a) * r, h_dn, Math.sin(a) * r)
  })

  const verts: number[] = []
  const norms: number[] = []

  // Compute a single flat normal for the kite face (average of its 2 triangle normals).
  // All 6 buffer vertices of the kite receive this same normal — no diagonal seam.
  const kiteFaceNormal = (
    a1: THREE.Vector3, b1: THREE.Vector3, c1: THREE.Vector3,
    a2: THREE.Vector3, b2: THREE.Vector3, c2: THREE.Vector3,
  ): THREE.Vector3 => {
    const triNormal = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
      const n = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(b, a),
          new THREE.Vector3().subVectors(c, a),
        ).normalize()
      // Centroid trick — flip if pointing inward
      if (n.dot(new THREE.Vector3().addVectors(a, b).add(c).divideScalar(3)) < 0) n.negate()
      return n
    }
    return new THREE.Vector3().addVectors(triNormal(a1, b1, c1), triNormal(a2, b2, c2)).normalize()
  }

  const pushFace = (
    a1: THREE.Vector3, b1: THREE.Vector3, c1: THREE.Vector3,
    a2: THREE.Vector3, b2: THREE.Vector3, c2: THREE.Vector3,
  ) => {
    const fn = kiteFaceNormal(a1, b1, c1, a2, b2, c2)
    for (const v of [a1, b1, c1, a2, b2, c2]) {
      verts.push(v.x, v.y, v.z)
      norms.push(fn.x, fn.y, fn.z)
    }
  }

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    // Upper kite face {T, U[i], L[i], U[j]}
    pushFace(T, L[i], U[i],  T, U[j], L[i])
    // Lower kite face {B, L[i], U[j], L[j]}
    pushFace(B, L[i], U[j],  B, U[j], L[j])
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norms, 3))
  return buildPolyGeo(geo, 10)
}

/* ════════════════════════════════════════════════════════════════
   DIE REGISTRY
   Single source of truth. Add one entry here to support a new die.
   ════════════════════════════════════════════════════════════════ */

export type DieType = 4 | 6 | 8 | 10 | 12 | 20

interface DieSpec {
  label:      string
  sides:      number
  colorCss:   string
  colorHex:   number
  emissive:   number
  collider:   'cuboid' | 'hull'
  halfExt:    number          // only used when collider='cuboid'
  makeGeo:    () => THREE.BufferGeometry
  /** Maps material group index → face value for texture + detection */
  faceMap:    number[]
  /** Font size multiplier for number textures (1.0 = default) */
  numScale:     number
  /** Multipliers applied to PHYSICS.impulse and PHYSICS.torque at launch */
  impulseScale: number
  torqueScale:  number
}

// D6: BoxGeometry group order → +X, -X, +Y, -Y, +Z, -Z
// Conventional D6 opposite faces sum to 7
const D6_FACE_MAP = [4, 3, 1, 6, 2, 5]

export const DIE_SPEC: Record<DieType, DieSpec> = {
  4:  {
    label: 'D4',  sides: 4,
    colorCss: '#7dd8f0', colorHex: 0x7dd8f0, emissive: 0x061820,
    collider: 'hull', halfExt: 0,
    makeGeo: () => buildPolyGeo(new THREE.TetrahedronGeometry(0.52, 0), 4),
    faceMap: [1, 2, 3, 4],
    numScale: 0.50, impulseScale: 0.25, torqueScale: 0.25,
  },
  6:  {
    label: 'D6',  sides: 6,
    colorCss: '#e8b84b', colorHex: 0xe8b84b, emissive: 0x1a1200,
    collider: 'cuboid', halfExt: 0.3,
    makeGeo: () => new THREE.BoxGeometry(0.6, 0.6, 0.6),
    faceMap: D6_FACE_MAP,
    numScale: 1.00, impulseScale: 0.60, torqueScale: 0.60,
  },
  8:  {
    label: 'D8',  sides: 8,
    colorCss: '#90d8a8', colorHex: 0x90d8a8, emissive: 0x082814,
    collider: 'hull', halfExt: 0,
    makeGeo: () => buildPolyGeo(new THREE.OctahedronGeometry(0.50, 0), 8),
    faceMap: [1, 2, 3, 4, 5, 6, 7, 8],
    numScale: 0.50, impulseScale: 0.60, torqueScale: 0.60,
  },
  10: {
    label: 'D10', sides: 10,
    colorCss: '#f0a060', colorHex: 0xf0a060, emissive: 0x2a1106,
    collider: 'hull', halfExt: 0,
    makeGeo: makeD10Geo,
    faceMap: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    numScale: 0.50, impulseScale: 0.60, torqueScale: 0.60,
  },
  12: {
    label: 'D12', sides: 12,
    colorCss: '#d0a8f8', colorHex: 0xd0a8f8, emissive: 0x180630,
    collider: 'hull', halfExt: 0,
    makeGeo: () => buildPolyGeo(new THREE.DodecahedronGeometry(0.46, 0), 12),
    faceMap: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    numScale: 0.70, impulseScale: 0.60, torqueScale: 0.60,
  },
  20: {
    label: 'D20', sides: 20,
    colorCss: '#f07080', colorHex: 0xf07080, emissive: 0x280610,
    collider: 'hull', halfExt: 0,
    makeGeo: () => buildPolyGeo(new THREE.IcosahedronGeometry(0.50, 0), 20),
    faceMap: Array.from({ length: 20 }, (_, i) => i + 1),
    numScale: 0.60, impulseScale: 0.60, torqueScale: 0.60,
  },
}

export const ALL_DIE_TYPES = [4, 6, 8, 10, 12, 20] as DieType[]

export interface DiceRollRequest {
  dieType: DieType
  count:   number
}

/* ════════════════════════════════════════════════════════════════
   MATERIAL CACHE — built once at module level, shared across renders
   ════════════════════════════════════════════════════════════════ */

function buildMaterials(spec: DieSpec): THREE.MeshStandardMaterial[] {
  return spec.faceMap.map((faceValue, groupIndex) => {
    const tex = spec.sides === 6 && groupIndex < 6
      ? makePipTex(faceValue, spec.colorCss)
      : makeNumberTex(faceValue, spec.colorCss, spec.numScale)
    return new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.22, metalness: 0.42,
    })
  })
}

const DICE_MATS: Record<DieType, THREE.MeshStandardMaterial[]> =
  Object.fromEntries(
    ALL_DIE_TYPES.map(t => [t, buildMaterials(DIE_SPEC[t])]),
  ) as Record<DieType, THREE.MeshStandardMaterial[]>

/* ════════════════════════════════════════════════════════════════
   FACE DETECTION
   Determines which face value is on top after the die settles.
   ════════════════════════════════════════════════════════════════ */

const _v0 = new THREE.Vector3()
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()
const _e1 = new THREE.Vector3()
const _e2 = new THREE.Vector3()
const _n  = new THREE.Vector3()
const _ct = new THREE.Vector3()

/**
 * Finds the face group whose outward normal is most aligned with world +Y.
 * Returns the value from `spec.faceMap` for that face.
 */
function detectTopFace(
  geo:       THREE.BufferGeometry,
  q:         THREE.Quaternion,
  spec:      DieSpec,
): number {
  const pos      = geo.attributes.position
  const idx      = geo.index
  const total    = idx ? idx.count : pos.count
  const perFace  = Math.floor(total / spec.faceMap.length)

  let bestGroup = 0
  let bestY     = -Infinity

  for (let face = 0; face < spec.faceMap.length; face++) {
    const start = face * perFace

    // First triangle of this face group
    let i0: number, i1: number, i2: number
    if (idx) {
      i0 = idx.getX(start);  i1 = idx.getX(start + 1);  i2 = idx.getX(start + 2)
    } else {
      i0 = start;  i1 = start + 1;  i2 = start + 2
    }

    _v0.fromBufferAttribute(pos, i0)
    _v1.fromBufferAttribute(pos, i1)
    _v2.fromBufferAttribute(pos, i2)

    // Face normal via cross product
    _e1.subVectors(_v1, _v0)
    _e2.subVectors(_v2, _v0)
    _n.crossVectors(_e1, _e2).normalize()

    // Ensure outward-facing (centroid trick — works for convex polyhedra)
    _ct.addVectors(_v0, _v1).add(_v2).divideScalar(3)
    if (_n.dot(_ct) < 0) _n.negate()

    // Rotate to world space
    _n.applyQuaternion(q)

    if (_n.y > bestY) { bestY = _n.y; bestGroup = face }
  }

  return spec.faceMap[bestGroup]
}

/* ════════════════════════════════════════════════════════════════
   PHYSICS CONSTANTS — all tuning lives here
   ════════════════════════════════════════════════════════════════ */

export const PHYSICS = {
  gravity:        -24,
  restitution:    0.02,
  friction:       0.95,
  linearDamping:  0.80,
  angularDamping: 0.80,
  impulse:        1.0,
  torque:         8,
  spawnYMin:      3.5,
  spawnYMax:      4.5,
  spawnXHalf:     2.0,
  spawnZHalf:     1.5,
  settleVel:      0.08,
  settleAng:      0.08,
  settleFrames:   20,
  minRollMs:      1200,
} as const

/* ════════════════════════════════════════════════════════════════
   CAMERA SETUP
   ════════════════════════════════════════════════════════════════ */

export function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

/* ════════════════════════════════════════════════════════════════
   PHYSICS DIE — one component for all die types
   ════════════════════════════════════════════════════════════════ */

interface PhysicsDieProps {
  index:     number
  dieType:   DieType
  spawnPos:  [number, number, number]
  onSettled: (index: number, value: number) => void
}

function PhysicsDie({ index, dieType, spawnPos, onSettled }: PhysicsDieProps) {
  const spec         = DIE_SPEC[dieType]
  const rbRef        = useRef<any>(null)
  const spawnTime    = useRef(performance.now())
  const settled      = useRef(false)
  const quietFrames  = useRef(0)

  // Stable random initial rotation — must not re-randomise on re-render
  const initialRotation = useMemo<[number, number, number]>(() => [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  ], [])

  // Geometry built once per die instance
  const geo = useMemo(() => spec.makeGeo(), [spec])

  // Materials from module-level cache (shared, never rebuilt)
  const mats = DICE_MATS[dieType]

  // Hull points for non-cuboid collider
  const hullVerts = useMemo((): [ArrayLike<number>] | null =>
    spec.collider === 'hull'
      ? [geo.attributes.position.array as Float32Array]
      : null,
  [spec, geo])

  // Apply impulse shortly after mount, staggered per die
  useEffect(() => {
    const t = setTimeout(() => {
      const rb = rbRef.current
      if (!rb) return
      const imp = PHYSICS.impulse * spec.impulseScale
      const tor = PHYSICS.torque  * spec.torqueScale
      rb.applyImpulse({
        x: (Math.random() - 0.5) * imp,
        y: 0,
        z: (Math.random() - 0.5) * imp * 0.8,
      }, true)
      rb.applyTorqueImpulse({
        x: (Math.random() - 0.5) * tor,
        y: (Math.random() - 0.5) * tor,
        z: (Math.random() - 0.5) * tor,
      }, true)
    }, 80 + index * 120)
    return () => clearTimeout(t)
  }, [index])

  // Settle detection — when quiet, detect top face geometrically
  useFrame(() => {
    const rb = rbRef.current
    if (!rb || settled.current) return
    if (performance.now() - spawnTime.current < PHYSICS.minRollMs) return

    const lv = rb.linvel()
    const av = rb.angvel()
    const isQuiet =
      Math.hypot(lv.x, lv.y, lv.z) < PHYSICS.settleVel &&
      Math.hypot(av.x, av.y, av.z) < PHYSICS.settleAng

    if (isQuiet) {
      quietFrames.current++
      if (quietFrames.current >= PHYSICS.settleFrames) {
        settled.current = true
        const rot  = rb.rotation()
        const q    = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
        const value = detectTopFace(geo, q, spec)
        onSettled(index, value)
      }
    } else {
      quietFrames.current = 0
    }
  })

  return (
    <RigidBody
      ref={rbRef}
      colliders={false}
      position={spawnPos}
      rotation={initialRotation}
      restitution={PHYSICS.restitution}
      friction={PHYSICS.friction}
      linearDamping={PHYSICS.linearDamping}
      angularDamping={PHYSICS.angularDamping}
      mass={1}
    >
      {spec.collider === 'cuboid'
        ? <CuboidCollider args={[spec.halfExt, spec.halfExt, spec.halfExt]} />
        : <ConvexHullCollider args={hullVerts!} />
      }
      <mesh geometry={geo} material={mats} castShadow />
    </RigidBody>
  )
}

/* ════════════════════════════════════════════════════════════════
   ARENA — invisible floor + walls, sized for camera fov=50 y=11 z=3.5
   ════════════════════════════════════════════════════════════════ */

function Arena() {
  return (
    <>
      <RigidBody type="fixed" restitution={0.05} friction={0.95}>
        <CuboidCollider args={[12, 0.15, 10]} position={[0, -0.65, 0]} />
      </RigidBody>
      {([
        [[-8, 3,  0], [0.2, 8,  8]],
        [[ 8, 3,  0], [0.2, 8,  8]],
        [[ 0, 3, -7], [8,   8, 0.2]],
        [[ 0, 3,  7], [8,   8, 0.2]],
      ] as [[number,number,number],[number,number,number]][]).map(([pos, args], i) => (
        <RigidBody key={i} type="fixed" restitution={0.05} friction={0.60}>
          <CuboidCollider args={args} position={pos} />
        </RigidBody>
      ))}
    </>
  )
}

/* ════════════════════════════════════════════════════════════════
   DICE SCENE
   ════════════════════════════════════════════════════════════════ */

interface DiceSceneProps {
  dice:         DiceRollRequest[]
  onAllSettled: (results: number[]) => void
}

export function DiceScene({ dice, onAllSettled }: DiceSceneProps) {
  const results      = useRef<Record<number, number>>({})
  const settledCount = useRef(0)

  // Flatten dice array → [{dieType, globalIndex}]
  const flatDice = useMemo(() => {
    const out: { dieType: DieType; globalIndex: number }[] = []
    for (const req of dice) {
      for (let i = 0; i < req.count; i++) {
        out.push({ dieType: req.dieType, globalIndex: out.length })
      }
    }
    return out
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dice])

  const totalCount = flatDice.length

  const handleSettled = useCallback((idx: number, val: number) => {
    results.current[idx] = val
    settledCount.current++
    if (settledCount.current >= totalCount) {
      const vals = Array.from({ length: totalCount }, (_, i) => results.current[i] ?? 1)
      onAllSettled(vals)
    }
  }, [totalCount, onAllSettled])

  const spawnPositions = useMemo(() =>
    Array.from({ length: totalCount }, () => [
      (Math.random() - 0.5) * PHYSICS.spawnXHalf * 2,
      PHYSICS.spawnYMin + Math.random() * (PHYSICS.spawnYMax - PHYSICS.spawnYMin),
      (Math.random() - 0.5) * PHYSICS.spawnZHalf * 2,
    ] as [number, number, number]),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [totalCount],
  )

  return (
    <>
      <ambientLight intensity={0.30} />
      <directionalLight
        position={[4, 22, 6]} intensity={2.8} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={1}   shadow-camera-far={60}
        shadow-camera-left={-16} shadow-camera-right={16}
        shadow-camera-top={12}   shadow-camera-bottom={-12}
      />
      <pointLight position={[0, 14, 0]} intensity={1.5} color="#e8d090" />
      <pointLight position={[-9, 4, -5]} intensity={0.40} color="#4428b0" />
      <pointLight position={[ 9, 4,  5]} intensity={0.30} color="#b06020" />

      <Arena />

      {flatDice.map(({ dieType, globalIndex }, i) => (
        <PhysicsDie
          key={globalIndex}
          index={globalIndex}
          dieType={dieType}
          spawnPos={spawnPositions[i]}
          onSettled={handleSettled}
        />
      ))}
    </>
  )
}

/* ════════════════════════════════════════════════════════════════
   DICE OVERLAY — fullscreen portal
   ════════════════════════════════════════════════════════════════ */

type DicePhase = 'rolling' | 'ready'

export interface DiceOverlayProps {
  dice:     DiceRollRequest[]
  onClose:  () => void
  onResult?: (results: number[]) => void
}

export function DiceOverlay({ dice, onClose, onResult }: DiceOverlayProps) {
  const [phase,   setPhase]   = useState<DicePhase>('rolling')
  const [results, setResults] = useState<number[]>([])

  // Flat list of die types, parallel to results[]
  const flatDieTypes = useMemo(() => {
    const out: DieType[] = []
    for (const req of dice) {
      for (let i = 0; i < req.count; i++) out.push(req.dieType)
    }
    return out
  }, [dice])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const handleAllSettled = useCallback((vals: number[]) => {
    setResults(vals)
    setPhase('ready')
    onResult?.(vals)
  }, [onResult])

  const handleClick = useCallback(() => {
    if (phase === 'ready') onClose()
  }, [phase, onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.20)',
        cursor: phase === 'ready' ? 'pointer' : 'default',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 11, 3.5], fov: 50, near: 0.5, far: 80 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      >
        <CameraSetup />
        <Suspense fallback={null}>
          <Physics gravity={[0, PHYSICS.gravity, 0]}>
            <DiceScene dice={dice} onAllSettled={handleAllSettled} />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Rolling pulse */}
      <AnimatePresence>
        {phase === 'rolling' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.3, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', bottom: 44, width: '100%', textAlign: 'center',
              fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.28em',
              color: 'rgba(232,184,75,0.55)', pointerEvents: 'none',
            }}
          >
            ROLANDO…
          </motion.p>
        )}
      </AnimatePresence>

      {/* Results + click-to-exit hint */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute', bottom: 36, width: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {results.map((v, i) => {
                const dieColor = DIE_SPEC[flatDieTypes[i] ?? dice[0].dieType].colorCss
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 300 }}
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      border: `1.5px solid ${dieColor}`,
                      background: 'rgba(8,12,24,0.90)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700,
                      color: dieColor,
                      boxShadow: `0 0 14px ${dieColor}44`,
                    }}
                  >
                    {v}
                  </motion.div>
                )
              })}
            </div>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.26em',
              color: 'var(--color-arcano-glow)',
              textShadow: '0 0 28px rgba(232,184,75,0.9)',
            }}>
              CLIQUE PARA SAIR
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESC hint */}
      <p style={{
        position: 'absolute', top: 20, right: 24,
        fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.18)', pointerEvents: 'none',
      }}>
        ESC para fechar
      </p>
    </motion.div>,
    document.body,
  )
}

/* ════════════════════════════════════════════════════════════════
   DICE ROLLER WIDGET — inline UI on chapter page
   ════════════════════════════════════════════════════════════════ */

export function DiceRollerWidget() {
  const [dieType,    setDieType]  = useState<DieType>(6)
  const [count,      setCount]    = useState(2)
  const [open,       setOpen]     = useState(false)
  const [overlayKey, setKey]      = useState(0)

  const doRoll = useCallback(() => {
    if (open) return
    setKey(k => k + 1)
    setOpen(true)
  }, [open])

  const spec = DIE_SPEC[dieType]

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ background: 'var(--color-deep)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span style={{ fontSize: '1.2rem' }}>🎲</span>
        <div>
          <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-arcano-glow)' }}>
            Rolador de Dados 3D
          </h3>
          <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--color-text-muted)' }}>
            Física real — números em cada face, valor detectado geometricamente
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Die type */}
        <div>
          <p className="text-xs font-ui mb-2.5 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Tipo de dado
          </p>
          <div className="flex gap-2 flex-wrap">
            {ALL_DIE_TYPES.map(t => {
              const s = DIE_SPEC[t]
              const active = dieType === t
              return (
                <button
                  key={t}
                  onClick={() => setDieType(t)}
                  disabled={open}
                  className="px-3 py-1.5 text-sm font-ui font-semibold rounded border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    borderColor: active ? s.colorCss : 'var(--color-border)',
                    background:  active ? s.colorCss + '18' : 'transparent',
                    color:       active ? s.colorCss : 'var(--color-text-muted)',
                    boxShadow:   active ? `0 0 10px ${s.colorCss}44` : 'none',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <p className="text-xs font-ui mb-2.5 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Quantidade
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount(c => Math.max(1, c - 1))}
              disabled={open}
              className="w-9 h-9 rounded border flex items-center justify-center text-lg font-bold hover:border-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              −
            </button>
            <span className="w-10 text-center font-display font-bold text-2xl" style={{ color: 'var(--color-text-primary)' }}>
              {count}
            </span>
            <button
              onClick={() => setCount(c => Math.min(6, c + 1))}
              disabled={open}
              className="w-9 h-9 rounded border flex items-center justify-center text-lg font-bold hover:border-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              +
            </button>
            <span className="text-xs font-ui" style={{ color: 'var(--color-text-muted)' }}>máx. 6</span>
          </div>
        </div>

        {/* Roll button */}
        <button
          onClick={doRoll}
          disabled={open}
          className="w-full py-3 font-ui font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-40"
          style={{
            background: spec.colorCss + '22',
            border: `1px solid ${spec.colorCss}`,
            color: spec.colorCss,
            borderRadius: 4,
            letterSpacing: '0.18em',
            boxShadow: `0 0 16px ${spec.colorCss}33`,
          }}
        >
          Rolar {count}{spec.label}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <DiceOverlay
            key={overlayKey}
            dice={[{ dieType, count }]}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
