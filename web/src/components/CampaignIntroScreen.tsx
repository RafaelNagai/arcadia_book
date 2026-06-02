import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CampaignIntroScreenProps {
  title: string
  description: string
  imageUrl: string | null
  onDismiss: () => void
}

export function CampaignIntroScreen({ title, description, imageUrl, onDismiss }: CampaignIntroScreenProps) {
  const [titleDone, setTitleDone] = useState(false)
  const lines = description.trim() ? description.split('\n').filter(l => l.trim().length > 0) : []

  useEffect(() => {
    const timer = setTimeout(() => setTitleDone(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(4,6,12,0.82)',
          }} />
        </>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--color-void)',
        }} />
      )}

      <div style={{
        position: 'relative',
        maxWidth: 640,
        width: '100%',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--color-arcano)',
            letterSpacing: '0.06em',
            lineHeight: 1.2,
            textShadow: '0 0 40px rgba(200,146,42,0.45)',
          }}
        >
          {title}
        </motion.h1>

        <AnimatePresence>
          {titleDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}
            >
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.22, ease: 'easeOut' }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.75,
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 + lines.length * 0.22, duration: 0.5 }}
          onClick={onDismiss}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 2.5rem',
            borderRadius: 4,
            background: 'var(--color-arcano)',
            border: 'none',
            color: '#0A0A0A',
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 0 32px rgba(200,146,42,0.35)',
          }}
        >
          Entrar no Conto
        </motion.button>
      </div>
    </motion.div>
  )
}
