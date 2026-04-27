import { getAccent } from '@/components/character/types'
import type { CampaignDetail } from '@/data/campaignTypes'
import type { MapSummary } from '@/lib/mapTypes'

interface MapGalleryProps {
  campaign: CampaignDetail
  userId: string | undefined
  maps: MapSummary[]
  loading: boolean
  onEnterMap: (mapId: string) => void
  onCreate: () => void
  onDelete: (mapId: string) => void
}

export function MapGallery({ campaign, userId, maps, loading, onEnterMap, onCreate, onDelete }: MapGalleryProps) {
  const visibleMaps = campaign.isGm
    ? maps
    : maps.filter(m =>
        m.tokens.some(t =>
          t.character.userId === userId ||
          (userId != null && t.sharedWith.includes(userId)),
        ),
      )

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: '#04060C',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(6,10,22,0.9)', flexShrink: 0,
      }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '1.1rem',
          fontWeight: 700, color: '#EEF4FC', margin: 0,
        }}>
          Mapas da Campanha
        </p>
        {campaign.isGm && (
          <button
            onClick={onCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: 5,
              background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.35)',
              color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Novo mapa
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {loading && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: '3rem',
          }}>
            Carregando…
          </p>
        )}

        {!loading && visibleMaps.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: '4rem', gap: '0.75rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              fontWeight: 700, color: 'rgba(255,255,255,0.15)', margin: 0,
            }}>
              {campaign.isGm ? 'Nenhum mapa criado ainda.' : 'Nenhum mapa disponível para você.'}
            </p>
            {!campaign.isGm && (
              <p style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.2)', margin: 0,
              }}>
                O mestre precisa adicionar seu personagem a um mapa.
              </p>
            )}
          </div>
        )}

        {!loading && visibleMaps.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            {visibleMaps.map(m => (
              <MapCard
                key={m.id}
                map={m}
                isGm={campaign.isGm}
                onEnter={() => onEnterMap(m.id)}
                onDelete={() => onDelete(m.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── MapCard ───────────────────────────────────────────────────────────────────

function MapCard({ map, isGm, onEnter, onDelete }: {
  map: MapSummary
  isGm: boolean
  onEnter: () => void
  onDelete: () => void
}) {
  const thumbnail = map.layers[0]?.imageUrl ?? null
  const playerTokens = map.tokens.filter(t => t.isVisible).slice(0, 8)

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${map.isActive ? 'rgba(200,146,42,0.4)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.15s, transform 0.1s',
        boxShadow: map.isActive ? '0 0 0 1px rgba(200,146,42,0.2)' : 'none',
      }}
      onClick={onEnter}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = map.isActive ? 'rgba(200,146,42,0.65)' : 'rgba(255,255,255,0.2)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = map.isActive ? 'rgba(200,146,42,0.4)' : 'rgba(255,255,255,0.08)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: 'rgba(255,255,255,0.04)', flexShrink: 0,
        overflow: 'hidden', position: 'relative',
      }}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2rem', opacity: 0.15 }}>🗺</span>
          </div>
        )}

        {map.isActive && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            padding: '0.18rem 0.55rem', borderRadius: 99,
            background: 'rgba(200,146,42,0.9)',
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem',
            fontWeight: 700, color: '#0A0F1E',
            letterSpacing: '0.06em',
          }}>
            AO VIVO
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.65rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600,
            color: map.isActive ? 'var(--color-arcano)' : '#EEF4FC',
            margin: 0, flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {map.title}
          </p>

          {isGm && (
            <button
              title="Deletar mapa"
              onClick={e => { e.stopPropagation(); onDelete() }}
              style={{
                width: 22, height: 22, flexShrink: 0, borderRadius: 4, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
              onMouseEnter={e => { (e.currentTarget).style.color = '#ef4444'; (e.currentTarget).style.borderColor = 'rgba(239,68,68,0.4)' }}
              onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              🗑
            </button>
          )}
        </div>

        {/* Token avatars */}
        {playerTokens.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
            {playerTokens.map(t => {
              const accent = getAccent(t.character.afinidade)
              return (
                <div
                  key={t.id}
                  title={t.character.name}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: accent.bg, border: `1.5px solid ${accent.text}`,
                    overflow: 'hidden',
                  }}
                >
                  {t.character.imageUrl && (
                    <img src={t.character.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )
            })}
            {map.tokens.length > 8 && (
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.3)', marginLeft: 2,
              }}>
                +{map.tokens.length - 8}
              </span>
            )}
          </div>
        ) : (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.2)', margin: 0,
          }}>
            Sem tokens
          </p>
        )}
      </div>
    </div>
  )
}
