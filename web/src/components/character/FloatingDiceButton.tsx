import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DiceOverlay, ALL_DIE_TYPES, DIE_SPEC } from '@/components/widgets/DiceRollerWidget'
import type { DieType, DiceRollRequest } from '@/components/widgets/DiceRollerWidget'

interface FloatingDiceButtonProps {
  accentColor: string
}

const MAX_TOTAL = 20

export function FloatingDiceButton({ accentColor }: FloatingDiceButtonProps) {
  const [expanded,    setExpanded]    = useState(false)
  const [selections,  setSelections]  = useState<Record<DieType, number>>(
    () => Object.fromEntries(ALL_DIE_TYPES.map(t => [t, 0])) as Record<DieType, number>
  )
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayKey,  setOverlayKey]  = useState(0)

  const totalSelected = ALL_DIE_TYPES.reduce((s, t) => s + selections[t], 0)

  // ESC closes the panel
  useEffect(() => {
    if (!expanded) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expanded])

  const adjust = useCallback((dieType: DieType, delta: number) => {
    setSelections(prev => {
      const total = ALL_DIE_TYPES.reduce((s, t) => s + prev[t], 0)
      if (delta > 0 && total >= MAX_TOTAL) return prev
      return { ...prev, [dieType]: Math.max(0, prev[dieType] + delta) }
    })
  }, [])

  const diceRequests = useMemo<DiceRollRequest[]>(() =>
    ALL_DIE_TYPES
      .filter(t => selections[t] > 0)
      .map(t => ({ dieType: t, count: selections[t] })),
    [selections]
  )

  const handleRoll = useCallback(() => {
    if (totalSelected === 0) return
    setOverlayKey(k => k + 1)
    setOverlayOpen(true)
    setExpanded(false)
  }, [totalSelected])

  return (
    <>
      {/* Selection panel — expands upward */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: 152,
              right: 28,
              zIndex: 79,
              background: 'var(--color-deep)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '12px 14px',
              minWidth: 186,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: '0 8px 40px rgba(0,0,0,0.65)',
            }}
          >
            {/* Die selectors */}
            {ALL_DIE_TYPES.map(t => {
              const spec   = DIE_SPEC[t]
              const count  = selections[t]
              const canAdd = totalSelected < MAX_TOTAL
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Label */}
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: count > 0 ? spec.colorCss : 'var(--color-text-muted)',
                      width: 30,
                      letterSpacing: '0.05em',
                      transition: 'color 0.15s',
                    }}
                  >
                    {spec.label}
                  </span>

                  {/* Minus */}
                  <button
                    onClick={() => adjust(t, -1)}
                    disabled={count === 0}
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      border: `1px solid ${count > 0 ? spec.colorCss + '88' : 'var(--color-border)'}`,
                      background: 'transparent',
                      color: count > 0 ? spec.colorCss : 'var(--color-text-muted)',
                      cursor: count === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, lineHeight: 1,
                      opacity: count === 0 ? 0.35 : 1,
                      transition: 'all 0.12s',
                    }}
                  >
                    −
                  </button>

                  {/* Count */}
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 15,
                      color: count > 0 ? spec.colorCss : 'var(--color-text-muted)',
                      width: 18,
                      textAlign: 'center',
                      transition: 'color 0.15s',
                    }}
                  >
                    {count}
                  </span>

                  {/* Plus */}
                  <button
                    onClick={() => adjust(t, +1)}
                    disabled={!canAdd}
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      border: `1px solid ${canAdd ? spec.colorCss + '88' : 'var(--color-border)'}`,
                      background: 'transparent',
                      color: canAdd ? spec.colorCss : 'var(--color-text-muted)',
                      cursor: !canAdd ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, lineHeight: 1,
                      opacity: !canAdd ? 0.35 : 1,
                      transition: 'all 0.12s',
                    }}
                  >
                    +
                  </button>
                </div>
              )
            })}

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 0' }} />

            {/* Roll button */}
            <button
              onClick={handleRoll}
              disabled={totalSelected === 0}
              style={{
                width: '100%',
                padding: '7px 0',
                borderRadius: 6,
                border: `1px solid ${totalSelected > 0 ? accentColor : 'var(--color-border)'}`,
                background: totalSelected > 0 ? accentColor + '22' : 'transparent',
                color: totalSelected > 0 ? accentColor : 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.22em',
                cursor: totalSelected === 0 ? 'not-allowed' : 'pointer',
                opacity: totalSelected === 0 ? 0.45 : 1,
                transition: 'all 0.15s',
                boxShadow: totalSelected > 0 ? `0 0 12px ${accentColor}33` : 'none',
              }}
            >
              ROLAR{totalSelected > 0 ? ` (${totalSelected})` : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating dice button */}
      <button
        onClick={() => setExpanded(e => !e)}
        title="Rolar dados"
        style={{
          position: 'fixed',
          bottom: 92,
          right: 28,
          zIndex: 80,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: expanded
            ? `linear-gradient(135deg, ${accentColor}33, rgba(4,10,20,0.95))`
            : `linear-gradient(135deg, rgba(20,30,55,0.95), rgba(4,10,20,0.95))`,
          border: `1px solid ${expanded ? accentColor + '88' : accentColor + '55'}`,
          boxShadow: expanded
            ? `0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${accentColor}55`
            : `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accentColor}33`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = `0 6px 32px rgba(0,0,0,0.6), 0 0 28px ${accentColor}66`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = expanded
            ? `0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${accentColor}55`
            : `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accentColor}33`
        }}
      >
        🎲
      </button>

      {/* Dice overlay */}
      <AnimatePresence>
        {overlayOpen && (
          <DiceOverlay
            key={overlayKey}
            dice={diceRequests}
            onClose={() => setOverlayOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
