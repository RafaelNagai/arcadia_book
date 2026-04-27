import { useState } from 'react'
import { getAccent } from '@/components/character/types'
import type { GameMap } from '@/lib/mapTypes'
import type { CampaignChar } from '@/data/campaignTypes'

const PREFERRED_SIZES_KEY = 'arcadia_preferred_token_sizes'

function loadPreferredSize(characterId: string): number | null {
  try {
    const raw = localStorage.getItem(PREFERRED_SIZES_KEY)
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, number>
    return map[characterId] ?? null
  } catch {
    return null
  }
}

function savePreferredSize(characterId: string, size: number) {
  try {
    const raw = localStorage.getItem(PREFERRED_SIZES_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {}
    map[characterId] = size
    localStorage.setItem(PREFERRED_SIZES_KEY, JSON.stringify(map))
  } catch {}
}

export function loadPreferredTokenSize(characterId: string, mapDefault: number): number {
  return loadPreferredSize(characterId) ?? mapDefault
}

interface TokenModalCharacter {
  id: string
  name: string
  imageUrl?: string | null
  afinidade: string
}

interface MapTokenModalProps {
  character: TokenModalCharacter
  visionRadius: number | null
  size: number
  sharedWith?: string[]
  map: GameMap
  players?: CampaignChar[]
  onSave: (visionRadius: number | null, size: number) => void
  onShareUpdate?: (sharedWith: string[]) => void
  onClose: () => void
}

export function MapTokenModal({
  character, visionRadius, size, sharedWith = [], map, players = [],
  onSave, onShareUpdate, onClose,
}: MapTokenModalProps) {
  const [useMapDefault, setUseMapDefault] = useState(visionRadius == null)
  const [radius, setRadius] = useState(visionRadius ?? map.defaultVisionRadius)
  const [tokenSize, setTokenSize] = useState(size)
  const [localShared, setLocalShared] = useState<string[]>(sharedWith)

  const accent = getAccent(character.afinidade)
  const hasPlayers = players.length > 0
  const sharingChanged = JSON.stringify([...localShared].sort()) !== JSON.stringify([...sharedWith].sort())

  function handleSave() {
    savePreferredSize(character.id, tokenSize)
    onSave(useMapDefault ? null : radius, tokenSize)
    if (onShareUpdate && sharingChanged) {
      onShareUpdate(localShared)
    }
    onClose()
  }

  function togglePlayer(userId: string) {
    setLocalShared(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId],
    )
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '1.5rem', width: 340, maxWidth: 'calc(100vw - 2rem)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: accent.bg, border: `2px solid ${accent.text}`,
            overflow: 'hidden',
          }}>
            {character.imageUrl && (
              <img src={character.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#EEF4FC' }}>
              {character.name}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: accent.text, marginTop: 2 }}>
              {character.afinidade}
            </p>
          </div>
          <a
            href={`/ficha/${character.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir ficha em nova aba"
            style={{
              marginLeft: 'auto', padding: '0.3rem 0.65rem', borderRadius: 4,
              background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.25)',
              color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
              fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0,
            }}
          >
            Ficha ↗
          </a>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        {/* Token size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          }}>
            Tamanho do Token — {tokenSize.toFixed(2)}×
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="range" min={0.25} max={10} step={0.25}
              value={tokenSize}
              onChange={e => setTokenSize(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-arcano)' }}
            />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', width: 36, textAlign: 'right' }}>
              {tokenSize.toFixed(2)}×
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
            <span>0.25×</span><span>10×</span>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

        {/* Vision radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          }}>
            Raio de Visão
          </p>

          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)',
          }}>
            <input
              type="checkbox"
              checked={useMapDefault}
              onChange={e => setUseMapDefault(e.target.checked)}
              style={{ accentColor: 'var(--color-arcano)', width: 14, height: 14 }}
            />
            Usar padrão do mapa ({map.defaultVisionRadius}px)
          </label>

          {!useMapDefault && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="range"
                min={50}
                max={2000}
                step={10}
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--color-arcano)' }}
              />
              <input
                type="number"
                min={50}
                max={2000}
                step={10}
                value={radius}
                onChange={e => setRadius(Math.min(2000, Math.max(50, Number(e.target.value))))}
                style={{
                  width: 60, padding: '0.3rem 0.4rem', borderRadius: 4,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
                  textAlign: 'center', outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Sharing section */}
        {hasPlayers && onShareUpdate && (
          <>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              }}>
                Compartilhar Visão com
              </p>
              {players.map(p => {
                const checked = localShared.includes(p.userId)
                return (
                  <label
                    key={p.userId}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                      padding: '0.35rem 0.5rem', borderRadius: 4,
                      background: checked ? 'rgba(200,146,42,0.07)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${checked ? 'rgba(200,146,42,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlayer(p.userId)}
                      style={{ accentColor: 'var(--color-arcano)', width: 14, height: 14, flexShrink: 0 }}
                    />
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                    }}>
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
                      color: checked ? 'var(--color-arcano)' : 'rgba(255,255,255,0.55)',
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.name}
                    </span>
                  </label>
                )
              })}
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '0.45rem 1rem', borderRadius: 4,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={handleSave} style={{
            padding: '0.45rem 1rem', borderRadius: 4,
            background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.4)',
            color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
          }}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
