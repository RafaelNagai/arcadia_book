import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDiceLog } from '@/lib/diceLog'
import { LogEntry } from './DiceLogEntries'

export function DiceLogSidebar() {
  const { entries, clearLog, isLogOpen, setLogOpen } = useDiceLog()

  useEffect(() => {
    if (isLogOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isLogOpen])

  return createPortal(
    <>
      <AnimatePresence>
        {isLogOpen && (
          <motion.div
            key="log-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLogOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2,4,12,0.55)',
              zIndex: 9000,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogOpen && (
          <motion.div
            key="log-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 340,
              maxWidth: '90vw',
              background: 'var(--color-deep)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 9001,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 16px 14px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📜</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '0.06em',
                }}>
                  Histórico
                </span>
                {entries.length > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 10,
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    padding: '1px 7px',
                  }}>
                    {entries.length}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {entries.length > 0 && (
                  <button
                    onClick={clearLog}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: 'var(--color-text-muted)',
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: 5,
                      padding: '4px 9px',
                      cursor: 'pointer',
                    }}
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setLogOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid var(--color-border)',
                    background: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Entries */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {entries.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingTop: 60,
                }}>
                  <span style={{ fontSize: 28, opacity: 0.25 }}>🎲</span>
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                  }}>
                    Nenhuma rolagem ainda
                  </p>
                </div>
              ) : (
                entries.map(e => <LogEntry key={e.id} entry={e} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
