import { useState } from 'react'
import { api } from '@/lib/apiClient'
import { getAccent } from '@/components/character/types'
import type { MapBroadcastEvent } from '@/hooks/useMapRealtime'
import type { CampaignChar } from '@/data/campaignTypes'
import type { GameMap, MapToken } from '@/lib/mapTypes'
import { MapTokenModal } from './MapTokenModal'

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
  const [removing, setRemoving] = useState<string | null>(null)
  const [configuringChar, setConfiguringChar] = useState<CampaignChar | null>(null)
  const [pendingVisionRadii, setPendingVisionRadii] = useState<Record<string, number | null>>({})

  const activeLayer = map.layers.find(l => l.isActive)
  // Layers sorted highest floor first for display
  const sortedLayers = [...map.layers].sort((a, b) => b.orderIndex - a.orderIndex)
  // Characters not placed on any layer
  const charsNotOnMap = allChars.filter(c => !tokens.some(t => t.characterId === c.id))

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

  function handleDragStart(e: React.DragEvent, char: CampaignChar) {
    e.dataTransfer.setData('charId', char.id)
    const vr = pendingVisionRadii[char.id]
    e.dataTransfer.setData('visionRadius', vr != null ? String(vr) : '')
    e.dataTransfer.effectAllowed = 'copy'
  }

  const hasAnyTokens = tokens.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem',
      }}>
        Tokens no mapa
      </p>

      {!hasAnyTokens && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          Nenhum token colocado.
        </p>
      )}

      {/* Tokens grouped by layer (highest floor first) */}
      {sortedLayers.map(layer => {
        const layerTokens = tokens.filter(t => t.layerId === layer.id)
        if (layerTokens.length === 0) return null
        return (
          <div key={layer.id}>
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: layer.isActive ? 'rgba(200,146,42,0.6)' : 'rgba(255,255,255,0.18)',
              paddingLeft: '0.25rem', marginBottom: '0.2rem',
            }}>
              {layer.name}
            </p>
            {layerTokens.map(token => {
              const accent = getAccent(token.character.afinidade)
              return (
                <div key={token.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.6rem', borderRadius: 4,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  marginBottom: '0.25rem',
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
          </div>
        )
      })}

      {/* Characters available to drag onto the current layer */}
      {activeLayer && charsNotOnMap.length > 0 && (
        <>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem', marginTop: '0.25rem',
          }}>
            Arrastar para o mapa
          </p>
          {charsNotOnMap.map(char => (
            <div
              key={char.id}
              draggable
              onDragStart={(e) => handleDragStart(e, char)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.6rem', borderRadius: 4,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'grab', userSelect: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,146,42,0.06)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,146,42,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0,
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
                onClick={(e) => { e.stopPropagation(); setConfiguringChar(char) }}
                title="Configurar token"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: pendingVisionRadii[char.id] != null ? 'var(--color-arcano)' : 'rgba(255,255,255,0.2)',
                  fontSize: '0.75rem', padding: '0.1rem', flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = pendingVisionRadii[char.id] != null ? 'var(--color-arcano)' : 'rgba(255,255,255,0.2)' }}
              >
                ⚙
              </button>
            </div>
          ))}
        </>
      )}

      {configuringChar && (
        <MapTokenModal
          character={configuringChar}
          visionRadius={pendingVisionRadii[configuringChar.id] ?? null}
          map={map}
          onSave={(vr) => {
            setPendingVisionRadii(prev => ({ ...prev, [configuringChar.id]: vr }))
          }}
          onClose={() => setConfiguringChar(null)}
        />
      )}
    </div>
  )
}
