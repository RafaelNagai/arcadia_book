import type { GameMap } from '@/lib/mapTypes'

type MapSummary = Pick<GameMap, 'id' | 'title' | 'isActive'>

interface Props {
  maps: MapSummary[]
  activeMapId: string | null
  loading: boolean
  onSwitch: (mapId: string) => void
  onDelete: (mapId: string) => void
  onSettings: () => void
  onCreate: () => void
  onClose: () => void
}

export function MapListPanel({ maps, activeMapId, loading, onSwitch, onDelete, onSettings, onCreate, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '1.5rem', width: 420, maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100vh - 6rem)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', margin: 0 }}>
            Mapas da Campanha
          </p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          {loading && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem 0' }}>
              Carregando…
            </p>
          )}

          {!loading && maps.length === 0 && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem 0' }}>
              Nenhum mapa criado ainda.
            </p>
          )}

          {!loading && maps.map(m => {
            const isActive = m.id === activeMapId
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 0.75rem', borderRadius: 5,
                  background: isActive ? 'rgba(200,146,42,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(200,146,42,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <span style={{
                  flex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.82rem',
                  color: isActive ? 'var(--color-arcano)' : '#EEF4FC',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {m.title}
                </span>

                {isActive && (
                  <span style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.62rem',
                    color: 'var(--color-arcano)',
                    background: 'rgba(200,146,42,0.12)',
                    border: '1px solid rgba(200,146,42,0.25)',
                    borderRadius: 4, padding: '0.12rem 0.4rem',
                    flexShrink: 0,
                  }}>
                    Ativo
                  </span>
                )}

                {isActive && (
                  <button
                    title="Configurações do mapa"
                    onClick={onSettings}
                    style={iconBtnStyle}
                  >
                    ⚙
                  </button>
                )}

                {!isActive && (
                  <button
                    onClick={() => { onSwitch(m.id); onClose() }}
                    style={{
                      padding: '0.22rem 0.55rem', borderRadius: 4, flexShrink: 0,
                      background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.3)',
                      color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Ativar
                  </button>
                )}

                <button
                  title="Deletar mapa"
                  onClick={() => onDelete(m.id)}
                  style={iconBtnStyle}
                >
                  🗑
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => { onCreate(); onClose() }}
          style={{
            padding: '0.55rem', borderRadius: 4, cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-ui)', fontSize: '0.78rem',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
        >
          + Novo mapa
        </button>
      </div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem',
}
