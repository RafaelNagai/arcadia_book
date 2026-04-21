import { useState } from 'react'
import { api } from '@/lib/apiClient'
import { getAccent } from '@/components/character/types'
import type { MapBroadcastEvent } from '@/hooks/useMapRealtime'
import type { CampaignChar } from '@/data/campaignTypes'
import type { GameMap, MapToken } from '@/lib/mapTypes'

interface MapTokenPanelProps {
  campaignId: string
  map: GameMap
  tokens: MapToken[]
  allChars: CampaignChar[]
  onTokensChange: (tokens: MapToken[]) => void
  onBroadcast: (event: MapBroadcastEvent) => void
  onTokenEdit?: (tokenId: string) => void
}

export function MapTokenPanel({
  campaignId,
  map,
  tokens,
  allChars,
  onTokensChange,
  onBroadcast,
  onTokenEdit,
}: MapTokenPanelProps) {
  const [adding, setAdding] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const activeLayer = map.layers.find(l => l.isActive)
  const tokenCharIds = new Set(tokens.map(t => t.characterId))

  async function handleAdd(char: CampaignChar) {
    if (!activeLayer) return
    setAdding(char.id)
    try {
      const res = await api.maps.createToken(campaignId, map.id, {
        layer_id: activeLayer.id,
        character_id: char.id,
        x: 100,
        y: 100,
      })
      const newToken = res.token as MapToken
      onTokensChange([...tokens, newToken])
      onBroadcast({ type: 'TOKEN_ADD', token: newToken })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setAdding(null)
    }
  }

  async function handleRemove(token: MapToken) {
    setRemoving(token.id)
    try {
      await api.maps.deleteToken(campaignId, map.id, token.id)
      onTokensChange(tokens.filter(t => t.id !== token.id))
      onBroadcast({ type: 'TOKEN_REMOVE', tokenId: token.id })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setRemoving(null)
    }
  }

  const onMapTokens = tokens.filter(t => t.layerId === activeLayer?.id)
  const charsNotOnLayer = allChars.filter(c => !onMapTokens.some(t => t.characterId === c.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem',
      }}>
        Tokens no mapa
      </p>

      {!activeLayer && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          Ative uma layer primeiro.
        </p>
      )}

      {/* Tokens already placed */}
      {onMapTokens.map(token => {
        const accent = getAccent(token.character.afinidade)
        return (
          <div key={token.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.6rem', borderRadius: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: accent.bg, border: `2px solid ${accent.text}`,
              overflow: 'hidden', flexShrink: 0,
            }}>
              {token.character.imageUrl && (
                <img src={token.character.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <p style={{
              flex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
              color: '#EEF4FC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {token.character.name}
            </p>
            {onTokenEdit && (
              <button
                onClick={() => onTokenEdit(token.id)}
                title="Configurar token"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', padding: '0.1rem',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)' }}
              >
                ⚙
              </button>
            )}
            <button
              onClick={() => handleRemove(token)}
              disabled={removing === token.id}
              title="Remover token"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', padding: '0.1rem',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)' }}
            >
              {removing === token.id ? '…' : '✕'}
            </button>
          </div>
        )
      })}

      {/* Characters available to add */}
      {activeLayer && charsNotOnLayer.length > 0 && (
        <>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem', marginTop: '0.25rem',
          }}>
            Adicionar
          </p>
          {charsNotOnLayer.map(char => {
            return (
              <div key={char.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.6rem', borderRadius: 4,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {char.imageUrl && (
                    <img src={char.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <p style={{
                  flex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.5)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {char.name}
                </p>
                <button
                  onClick={() => handleAdd(char)}
                  disabled={adding === char.id || !tokenCharIds || tokenCharIds.has(char.id)}
                  style={{
                    padding: '0.2rem 0.5rem', borderRadius: 3,
                    background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.25)',
                    color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                    fontSize: '0.65rem', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  {adding === char.id ? '…' : '+'}
                </button>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
