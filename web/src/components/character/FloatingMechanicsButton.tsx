import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Gamepad2, LockKeyhole, Settings2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface FloatingMechanicsButtonProps {
  accentColor: string
  isMenuOpen: boolean
  bottom: number
}

type LockDie = 4 | 6 | 12

const LOCK_DICE: LockDie[] = [4, 6, 12]
const MIN_PINS = 3
const MAX_PINS = 10

function clampValue(value: number, die: LockDie) {
  return Math.min(die, Math.max(1, value))
}

export function FloatingMechanicsButton({ accentColor, isMenuOpen, bottom }: FloatingMechanicsButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [lockOpen, setLockOpen] = useState(false)
  const [die, setDie] = useState<LockDie>(6)
  const [pinValues, setPinValues] = useState<number[]>(() => Array(MIN_PINS).fill(1))
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const updateViewport = () => setIsMobile(mediaQuery.matches)
    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    if (!pickerOpen && !lockOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPickerOpen(false)
        setLockOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pickerOpen, lockOpen])

  function openLockpick() {
    setPickerOpen(false)
    setLockOpen(true)
  }

  function changeDie(nextDie: LockDie) {
    setDie(nextDie)
    setPinValues(values => values.map(value => clampValue(value, nextDie)))
  }

  function changePinCount(delta: number) {
    setPinValues(values => {
      const nextCount = Math.min(MAX_PINS, Math.max(MIN_PINS, values.length + delta))
      if (nextCount > values.length) return [...values, ...Array(nextCount - values.length).fill(1)]
      return values.slice(0, nextCount)
    })
  }

  function changePinValue(index: number, delta: number) {
    setPinValues(values => values.map((value, valueIndex) =>
      valueIndex === index ? clampValue(value + delta, die) : value,
    ))
  }

  return (
    <>
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="Escolher mecânica"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              background: 'rgba(0,0,0,0.76)',
            }}
            onMouseDown={event => {
              if (event.target === event.currentTarget) setPickerOpen(false)
            }}
          >
            <div
              style={{
                width: 'min(360px, 100%)',
                padding: 24,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'linear-gradient(145deg, #10151d, #05070b)',
                boxShadow: '0 22px 80px rgba(0,0,0,0.65)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Settings2 size={18} color={accentColor} />
                <div>
                  <p style={eyebrowStyle}>Mecânicas</p>
                  <h2 style={headingStyle}>Escolha uma mecânica</h2>
                </div>
              </div>
              <button
                onClick={openLockpick}
                style={choiceButtonStyle(accentColor)}
              >
                <LockKeyhole size={20} color={accentColor} />
                <span>
                  <strong style={{ display: 'block', color: '#f2f5f8', fontFamily: 'var(--font-ui)', fontSize: 13 }}>Destrancar</strong>
                  <small style={{ color: 'rgba(220,230,240,0.56)', fontFamily: 'var(--font-ui)', fontSize: 11 }}>Abrir uma tranca por dedução</small>
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lockOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mecânica de destrancar"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 119,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.72)',
              padding: '24px 18px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 1180,
                minHeight: isMobile ? 0 : 260,
                maxHeight: 'calc(100dvh - 32px)',
                padding: isMobile ? '48px 14px 24px' : '48px 68px 38px',
                background: '#050505',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 24px 100px rgba(0,0,0,0.8)',
                overflowY: 'auto',
              }}
            >
              <button
                onClick={() => setLockOpen(false)}
                aria-label="Fechar mecânica de destrancar"
                title="Fechar"
                style={closeButtonStyle}
              >
                <X size={22} />
              </button>

              <div style={{ position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: isMobile ? 'stretch' : 'flex-start', minHeight: isMobile ? 76 : 42, marginBottom: isMobile ? 20 : 34 }}>
                <div style={{ textAlign: 'center', order: isMobile ? 2 : 1 }}>
                  <p style={eyebrowStyle}>Mecânica · Destrancar</p>
                  <h2 style={{ ...headingStyle, fontSize: 'clamp(1.25rem, 3vw, 1.8rem)' }}>Alinhe os pinos</h2>
                </div>
                <div style={{ position: isMobile ? 'static' : 'absolute', left: 0, top: 0, order: isMobile ? 1 : undefined, alignSelf: isMobile ? 'flex-start' : undefined, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={labelStyle}>Dado</span>
                  <select
                    value={die}
                    onChange={event => changeDie(Number(event.target.value) as LockDie)}
                    aria-label="Tipo de dado da tranca"
                    style={selectStyle(accentColor)}
                  >
                    {LOCK_DICE.map(option => <option key={option} value={option}>D{option}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: 'stretch', gap: 10, overflowY: isMobile ? 'auto' : undefined, padding: '4px 0 12px' }}>
                {pinValues.map((value, index) => (
                  <div key={index} style={pinStyle(accentColor, isMobile)}>
                    <span style={pinLabelStyle}>Pino {index + 1}</span>
                    <button
                      onClick={() => changePinValue(index, 1)}
                      aria-label={`Aumentar valor do pino ${index + 1}`}
                      style={arrowButtonStyle}
                    >
                      <ChevronUp size={25} />
                    </button>
                    <span style={{ color: '#f5f7fa', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.2rem)', lineHeight: 1, minWidth: 46, textAlign: 'center' }}>
                      {value}
                    </span>
                    <button
                      onClick={() => changePinValue(index, -1)}
                      aria-label={`Diminuir valor do pino ${index + 1}`}
                      style={arrowButtonStyle}
                    >
                      <ChevronDown size={25} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 18 }}>
                <span style={labelStyle}>Pinos</span>
                <button onClick={() => changePinCount(-1)} disabled={pinValues.length <= MIN_PINS} style={countButtonStyle(pinValues.length > MIN_PINS, accentColor)} aria-label="Remover pino">−</button>
                <span style={{ color: '#f5f7fa', fontFamily: 'var(--font-display)', fontSize: 18, minWidth: 24, textAlign: 'center' }}>{pinValues.length}</span>
                <button onClick={() => changePinCount(1)} disabled={pinValues.length >= MAX_PINS} style={countButtonStyle(pinValues.length < MAX_PINS, accentColor)} aria-label="Adicionar pino">+</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
          onClick={() => setPickerOpen(true)}
          title="Abrir mecânicas"
          aria-label="Abrir mecânicas"
          style={{
          position: 'fixed',
          bottom,
          right: 28,
          zIndex: 80,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(20,30,55,0.95), rgba(4,10,20,0.95))',
          border: `1px solid ${accentColor}55`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accentColor}33`,
          color: accentColor,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={event => {
          event.currentTarget.style.transform = 'scale(1.1)'
          event.currentTarget.style.boxShadow = `0 6px 32px rgba(0,0,0,0.6), 0 0 24px ${accentColor}55`
        }}
        onMouseLeave={event => {
          event.currentTarget.style.transform = 'scale(1)'
          event.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accentColor}33`
        }}
        >
          <Gamepad2 size={22} />
        </motion.button>}
      </AnimatePresence>
    </>
  )
}

const eyebrowStyle = {
  margin: 0,
  color: 'rgba(220,230,240,0.48)',
  fontFamily: 'var(--font-ui)',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
}

const headingStyle = {
  margin: '5px 0 0',
  color: '#f2f5f8',
  fontFamily: 'var(--font-display)',
  fontSize: '1.15rem',
  fontWeight: 700,
}

const labelStyle = {
  color: 'rgba(220,230,240,0.5)',
  fontFamily: 'var(--font-ui)',
  fontSize: 10,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
}

const choiceButtonStyle = (accentColor: string) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 13,
  padding: '14px 15px',
  textAlign: 'left' as const,
  background: `${accentColor}12`,
  border: `1px solid ${accentColor}55`,
  cursor: 'pointer',
})

const selectStyle = (accentColor: string) => ({
  padding: '7px 28px 7px 10px',
  border: `1px solid ${accentColor}66`,
  borderRadius: 4,
  background: '#11151b',
  color: '#f5f7fa',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  fontWeight: 700,
})

const pinStyle = (accentColor: string, isMobile: boolean) => ({
  minWidth: isMobile ? 0 : 92,
  width: isMobile ? '100%' : undefined,
  minHeight: isMobile ? 72 : undefined,
  padding: '12px 10px',
  display: 'flex',
  flexDirection: isMobile ? 'row' as const : 'column' as const,
  alignItems: 'center',
  justifyContent: isMobile ? 'space-between' : 'space-between',
  gap: 7,
  border: `1px solid ${accentColor}45`,
  background: 'linear-gradient(180deg, #151515, #090909)',
})

const pinLabelStyle = {
  color: 'rgba(220,230,240,0.48)',
  fontFamily: 'var(--font-ui)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
}

const arrowButtonStyle = {
  width: 42,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.04)',
  color: '#dce6f0',
  cursor: 'pointer',
}

const countButtonStyle = (enabled: boolean, accentColor: string) => ({
  width: 30,
  height: 30,
  border: `1px solid ${enabled ? accentColor + '77' : 'rgba(255,255,255,0.1)'}`,
  background: enabled ? `${accentColor}18` : 'transparent',
  color: enabled ? accentColor : 'rgba(255,255,255,0.25)',
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 20,
  lineHeight: 1,
})

const closeButtonStyle = {
  position: 'absolute' as const,
  top: 13,
  right: 14,
  width: 34,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'transparent',
  color: 'rgba(255,255,255,0.72)',
  cursor: 'pointer',
}
