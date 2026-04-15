import { useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DiceScene, CameraSetup, PHYSICS, DIE_SPEC,
} from '@/components/widgets/DiceRollerWidget'
import type { DiceRollRequest, DieType } from '@/components/widgets/DiceRollerWidget'
import { parseDamage, computeModifiers } from '@/lib/parseDamage'
import { useDiceLog } from '@/lib/diceLog'

/* ────────────────────────────────────────────────────────────────
   Props
   ──────────────────────────────────────────────────────────────── */

interface DamageRollOverlayProps {
  damageStr: string
  equipmentName: string
  onClose: () => void
}

type Phase = 'rolling' | 'settled'

const VALID_DIE_TYPES: DieType[] = [4, 6, 8, 10, 12, 20]

function resolveType(t: number): DieType {
  return (VALID_DIE_TYPES.includes(t as DieType) ? t : 6) as DieType
}

/* ────────────────────────────────────────────────────────────────
   Bonus badge — animates in over a die chip
   ──────────────────────────────────────────────────────────────── */

function BonusBadge({ value, delay }: { value: number; delay: number }) {
  const color = value >= 0 ? '#6EC840' : '#D04040'
  const label = value >= 0 ? `+${value}` : String(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 18 }}
      style={{
        position: 'absolute',
        top: -20,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 13,
        color,
        textShadow: `0 0 10px ${color}`,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {label}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Die chip with optional bonus
   ──────────────────────────────────────────────────────────────── */

function DieChip({
  value, mod, dieColor, index, showBonus,
}: {
  value: number
  mod: number
  dieColor: string
  index: number
  showBonus: boolean
}) {
  const finalValue = value + mod
  const hasMod = mod !== 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      {/* Bonus badge */}
      {hasMod && showBonus && (
        <BonusBadge value={mod} delay={index * 0.08 + 0.35} />
      )}

      {/* Die face */}
      <motion.div
        animate={hasMod && showBonus ? {
          borderColor: [dieColor, mod > 0 ? '#6EC840' : '#D04040', dieColor],
          boxShadow: [
            `0 0 10px ${dieColor}44`,
            `0 0 28px ${mod > 0 ? '#6EC84088' : '#D0404088'}`,
            `0 0 14px ${dieColor}44`,
          ],
        } : {}}
        transition={{ delay: index * 0.08 + 0.5, duration: 0.55 }}
        style={{
          width: 54, height: 54, borderRadius: 10,
          border: `2px solid ${dieColor}`,
          background: 'rgba(6,10,24,0.95)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 14px ${dieColor}44`,
          position: 'relative',
        }}
      >
        {hasMod ? (
          <>
            <motion.span
              initial={{ opacity: 1 }}
              animate={showBonus ? { opacity: 0 } : { opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.4, duration: 0.25 }}
              style={{
                position: 'absolute',
                fontFamily: 'Cinzel, serif', fontWeight: 800,
                fontSize: 22, color: dieColor,
                lineHeight: 1,
              }}
            >
              {value}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={showBonus ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.08 + 0.55, type: 'spring', stiffness: 340 }}
              style={{
                position: 'absolute',
                fontFamily: 'Cinzel, serif', fontWeight: 800,
                fontSize: 22,
                color: mod > 0 ? '#6EC840' : '#D04040',
                lineHeight: 1,
              }}
            >
              {finalValue}
            </motion.span>
          </>
        ) : (
          <span style={{
            fontFamily: 'Cinzel, serif', fontWeight: 800,
            fontSize: 22, color: dieColor,
          }}>
            {value}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Main overlay
   ──────────────────────────────────────────────────────────────── */

export function DamageRollOverlay({ damageStr, equipmentName, onClose }: DamageRollOverlayProps) {
  const { addEntry } = useDiceLog()
  const parsed = useMemo(() => parseDamage(damageStr), [damageStr])
  const [phase,     setPhase]     = useState<Phase>('rolling')
  const [results,   setResults]   = useState<number[]>([])
  const [showBonus, setShowBonus] = useState(false)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Build DiceRollRequest[] from all dice groups
  const diceRequest = useMemo<DiceRollRequest[]>(() => {
    if (!parsed) return []
    return parsed.dice.map(d => ({ dieType: resolveType(d.dieType), count: d.dieCount }))
  }, [parsed])

  // Flat list of die types, parallel to results[]
  const flatDieTypes = useMemo<DieType[]>(() =>
    diceRequest.flatMap(r => Array<DieType>(r.count).fill(r.dieType)),
    [diceRequest]
  )

  const modifiers = useMemo(
    () => parsed ? computeModifiers(results, parsed.bonuses) : [],
    [results, parsed]
  )

  const hasAnyBonus = useMemo(() => modifiers.some(m => m !== 0), [modifiers])

  // Color of first die group (used for "ROLANDO…" text)
  const leadColor = useMemo(
    () => flatDieTypes.length > 0 ? DIE_SPEC[flatDieTypes[0]].colorCss : '#e8b84b',
    [flatDieTypes]
  )

  const handleAllSettled = useCallback((vals: number[]) => {
    setResults(vals)
    setPhase('settled')
    if (parsed && parsed.bonuses.length > 0) {
      setTimeout(() => setShowBonus(true), 600)
    }
    // Log the damage roll
    const flatTypes = parsed
      ? parsed.dice.flatMap(d => Array<number>(d.dieCount).fill(d.dieType))
      : []
    const mods = parsed ? computeModifiers(vals, parsed.bonuses) : []
    addEntry({
      type: 'damage',
      damageStr,
      equipmentName,
      results: vals,
      flatDieTypes: flatTypes,
      modifiers: mods,
      total: vals.reduce((sum, v, i) => sum + v + (mods[i] ?? 0), 0),
    })
  }, [parsed, addEntry, damageStr, equipmentName])

  const formulaLabel = useMemo(() => {
    if (!parsed) return ''
    return parsed.dice.map(d => `${d.dieCount}D${d.dieType}`).join(' + ')
  }, [parsed])

  const bonusFormula = useMemo(() => {
    if (!parsed) return ''
    return parsed.bonuses.map(b => {
      const sign = b.value >= 0 ? '+' : ''
      const target = b.type === 'all' ? '(todos)' : 'maior'
      return `${sign}${b.value} ao ${target}`
    }).join(', ')
  }, [parsed])

  if (!parsed || diceRequest.length === 0) return null

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        overflow: 'hidden',
        background: 'rgba(2,4,12,0.70)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* 3D canvas */}
      <Canvas
        camera={{ position: [0, 11, 3.5], fov: 50, near: 0.5, far: 80 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      >
        <CameraSetup />
        <Suspense fallback={null}>
          <Physics gravity={[0, PHYSICS.gravity, 0]}>
            <DiceScene dice={diceRequest} onAllSettled={handleAllSettled} />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Rolling pulse */}
      <AnimatePresence>
        {phase === 'rolling' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', bottom: 48, width: '100%',
              textAlign: 'center', pointerEvents: 'none',
            }}
          >
            <motion.p
              animate={{ opacity: [0, 0.6, 0.3, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{
                fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.28em',
                color: `${leadColor}88`,
              }}
            >
              ROLANDO…
            </motion.p>
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: 11,
              color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em',
              marginTop: 6,
            }}>
              {formulaLabel}{bonusFormula ? ` · ${bonusFormula}` : ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results panel */}
      <AnimatePresence>
        {phase === 'settled' && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(2,4,14,0.98) 0%, rgba(2,4,14,0.90) 60%, transparent 100%)',
              padding: '24px 24px 36px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}
          >
            {/* Formula header */}
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 11,
              color: 'var(--color-text-muted)', letterSpacing: '0.14em',
              textAlign: 'center',
            }}>
              {parsed.dice.map((d, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.3)' }}> + </span>}
                  <span style={{ color: DIE_SPEC[resolveType(d.dieType)].colorCss }}>
                    {d.dieCount}D{d.dieType}
                  </span>
                </span>
              ))}
              {bonusFormula && (
                <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {bonusFormula}</span>
              )}
              {hasAnyBonus && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ color: '#6EC840', marginLeft: 6 }}
                >
                  ✓ bônus aplicado
                </motion.span>
              )}
            </div>

            {/* Die chips */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
              alignItems: 'flex-end',
            }}>
              {results.map((v, i) => (
                <DieChip
                  key={i}
                  value={v}
                  mod={modifiers[i] ?? 0}
                  dieColor={flatDieTypes[i] ? DIE_SPEC[flatDieTypes[i]].colorCss : '#e8b84b'}
                  index={i}
                  showBonus={showBonus}
                />
              ))}
            </div>

            {/* Close hint */}
            <p
              onClick={onClose}
              style={{
                fontFamily: 'var(--font-ui)', fontSize: 10,
                color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em',
                cursor: 'pointer', marginTop: 4,
              }}
            >
              ESC · clique para fechar
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESC hint (rolling) */}
      {phase === 'rolling' && (
        <p style={{
          position: 'absolute', top: 20, right: 24,
          fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.18)', pointerEvents: 'none',
        }}>
          ESC para fechar
        </p>
      )}
    </motion.div>,
    document.body,
  )
}
