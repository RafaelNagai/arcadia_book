import { useState } from 'react'
import type { MoralAction, ShipStateData } from '@/data/shipTypes'

function moralLevel(sum: number, diceCount: number): { label: string; color: string } | null {
  if (diceCount === 0) return null
  if (sum >= 50) return { label: 'Moral Lendária', color: '#E8B84B' }
  if (sum >= 25) return { label: 'Moral Estável', color: '#6FC892' }
  if (sum >= 10) return { label: 'Moral Baixa', color: '#E87A50' }
  return { label: 'Abaixo do mínimo', color: '#C05050' }
}

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

export function MoralPotPanel({ state, canEdit, onAction }: {
  state: ShipStateData | null
  canEdit: boolean
  onAction: (action: MoralAction) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const pool = state?.moralPool ?? []
  const sum = pool.reduce((a, b) => a + b, 0)
  const level = moralLevel(sum, pool.length)

  async function run(action: MoralAction) {
    if (busy) return
    setBusy(true)
    try {
      await onAction(action)
    } finally {
      setBusy(false)
    }
  }

  const buttonBase: React.CSSProperties = {
    borderRadius: 4, fontFamily: 'var(--font-ui)', cursor: busy ? 'not-allowed' : 'pointer',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.6)',
  }

  return (
    <div style={{
      background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6, padding: '1.25rem',
    }}>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#EEF4FC' }}>
            Pote de Moral
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Soma: <span style={{ color: '#EEF4FC', fontWeight: 700 }}>{sum}</span>
            {level && (
              <span style={{ marginLeft: '0.6rem', color: level.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.66rem' }}>
                {level.label}
              </span>
            )}
          </p>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button disabled={busy} onClick={() => run({ action: 'roll' })}
              style={{ ...buttonBase, padding: '0.45rem 0.85rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(80,200,232,0.12)', border: '1px solid rgba(80,200,232,0.35)', color: '#50C8E8' }}>
              Rolar 5D12
            </button>
            <button disabled={busy || pool.length === 0} onClick={() => run({ action: 'add' })}
              style={{ ...buttonBase, padding: '0.45rem 0.85rem', fontSize: '0.7rem' }}>
              + Adicionar Dado
            </button>
          </div>
        )}
      </div>

      {pool.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text-muted)', padding: '0.5rem 0' }}>
          Pote vazio — {canEdit ? 'role 5D12 para começar a sessão.' : 'aguardando o Capitão rolar os dados.'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
          {pool.map((value, index) => (
            <div key={index} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
              padding: '0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {canEdit ? (
                <input
                  type="number" min={1} max={12} value={value}
                  onChange={e => {
                    const v = Math.min(12, Math.max(1, Number(e.target.value) || 1))
                    if (v !== value) run({ action: 'set', index, value: v })
                  }}
                  style={{
                    width: 40, textAlign: 'center', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#EEF4FC',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', padding: '0.2rem 0',
                  }}
                />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: '#EEF4FC', width: 40, textAlign: 'center' }}>
                  {value}
                </span>
              )}
              {canEdit && (
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  <button disabled={busy} onClick={() => run({ action: 'adjust', index, delta: -1 })}
                    title="-1" style={{ ...buttonBase, width: 22, height: 20, fontSize: '0.7rem', padding: 0 }}>−</button>
                  <button disabled={busy} onClick={() => run({ action: 'adjust', index, delta: 1 })}
                    title="+1" style={{ ...buttonBase, width: 22, height: 20, fontSize: '0.7rem', padding: 0 }}>+</button>
                  <button disabled={busy} onClick={() => run({ action: 'remove', index })}
                    title="Remover dado" style={{ ...buttonBase, width: 22, height: 20, fontSize: '0.65rem', padding: 0, color: 'rgba(220,100,100,0.7)' }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {state && state.moralLog.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>
            Histórico
          </p>
          <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {state.moralLog.map(entry => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  {entry.detail}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
                  {timeAgo(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
