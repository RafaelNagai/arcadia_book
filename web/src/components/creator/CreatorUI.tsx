import { useState } from 'react'
import type { ReactNode } from 'react'
import { STEPS } from './types'

/* ─── Shared input style ────────────────────────────────────────── */

export const baseInputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4, outline: 'none',
  color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
  transition: 'border-color 0.15s',
}

/* ─── StepHeader ────────────────────────────────────────────────── */

export function StepHeader({ current, onBack }: { current: number; onBack: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(4,10,20,0.93)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            ← {current === 1 ? 'Sair' : 'Voltar'}
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {current} / {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s.id <= current ? 'var(--color-arcano)' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <p style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-arcano-dim)' }}>
          {STEPS[current - 1].label}
        </p>
      </div>
    </div>
  )
}

/* ─── Field ─────────────────────────────────────────────────────── */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>{hint}</p>}
    </div>
  )
}

/* ─── TextInput ─────────────────────────────────────────────────── */

export function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={baseInputStyle}
      onFocus={e => { e.target.style.borderColor = 'var(--color-arcano)' }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
    />
  )
}

/* ─── Stepper ───────────────────────────────────────────────────── */

export function Stepper({ value, min = 0, onChange, color = 'var(--color-arcano)' }: {
  value: number; min?: number; onChange: (v: number) => void; color?: string
}) {
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 28, height: 32, borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: disabled ? 'rgba(255,255,255,0.18)' : '#EEF4FC',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-ui)', fontSize: '1rem', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  })
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={btnStyle(value <= min)}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= min) onChange(v) }}
        style={{
          width: 48, height: 32, textAlign: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4, outline: 'none', color,
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
          MozAppearance: 'textfield',
        } as React.CSSProperties}
        onFocus={e => { e.target.style.borderColor = color }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
      />
      <button onClick={() => onChange(value + 1)} style={btnStyle(false)}>+</button>
    </div>
  )
}

/* ─── TagInput ──────────────────────────────────────────────────── */

export function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput('')
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder} style={{ ...baseInputStyle, flex: 1 }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-arcano)' }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
        <button onClick={add} style={{
          padding: '0.6rem 0.75rem', borderRadius: 4,
          background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.3)',
          color: 'var(--color-arcano-glow)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          Adicionar
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-ui)' }}>
              {tag}
              <button onClick={() => onChange(tags.filter(t => t !== tag))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', lineHeight: 1 }}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── StatPill ──────────────────────────────────────────────────── */

export function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-sm"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33` }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  )
}

/* ─── SectionDivider ────────────────────────────────────────────── */

export function SectionDivider({ label }: { label: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '1rem' }}>
      {label}
    </p>
  )
}
