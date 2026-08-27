import { useState } from 'react'

export function ShipCodePanel({ crewCode, onRegenerate }: {
  crewCode: string
  onRegenerate: () => Promise<void>
}) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(crewCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <button onClick={() => setShow(v => !v)}
        style={{
          padding: '0.5rem 0.75rem', borderRadius: 4, textAlign: 'left',
          background: show ? 'rgba(80,200,232,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${show ? 'rgba(80,200,232,0.25)' : 'rgba(255,255,255,0.08)'}`,
          color: show ? '#50C8E8' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer',
        }}>
        {show ? 'Ocultar código' : '🔑 Código de convite'}
      </button>
      {show && (
        <div style={{ padding: '0.6rem 0.75rem', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#50C8E8', textAlign: 'center', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            {crewCode}
          </p>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={copyCode} style={{
              flex: 1, padding: '0.3rem', borderRadius: 3,
              background: copied ? 'rgba(111,200,146,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${copied ? 'rgba(111,200,146,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: copied ? '#6FC892' : 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-ui)', fontSize: '0.65rem', cursor: 'pointer',
            }}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
            <button onClick={handleRegenerate} disabled={regenerating} style={{
              flex: 1, padding: '0.3rem', borderRadius: 3,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
              cursor: regenerating ? 'not-allowed' : 'pointer',
            }}>
              {regenerating ? '...' : 'Regenerar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
