import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/authContext'
import { useMapRealtime, useCampaignMapChannel } from '@/hooks/useMapRealtime'
import type { MapBroadcastEvent } from '@/hooks/useMapRealtime'
import type { CampaignDetail } from '@/data/campaignTypes'
import type { GameMap, MapToken, MapTool } from '@/lib/mapTypes'
import { MapCanvas } from './MapCanvas'
import { MapToolbar } from './MapToolbar'
import { MapLayerPanel } from './MapLayerPanel'
import { MapTokenPanel } from './MapTokenPanel'

const TOKEN_DRAG_THROTTLE_MS = 50

interface MapTabProps {
  campaign: CampaignDetail
}

// ── CreateMapModal ────────────────────────────────────────────────────────────

function CreateMapModal({ campaignId, onCreated, onClose }: {
  campaignId: string
  onCreated: (map: GameMap) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await api.maps.create(campaignId, { title: title.trim() })
      const map = res.map as GameMap
      await api.maps.activate(campaignId, map.id)
      onCreated({ ...map, isActive: true })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

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
          borderRadius: 8, padding: '1.5rem', width: 360, maxWidth: 'calc(100vw - 2rem)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '1rem' }}>
          Novo Mapa
        </p>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="Nome do mapa…"
          style={{
            width: '100%', padding: '0.6rem 0.75rem', borderRadius: 4,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.85rem',
            outline: 'none', marginBottom: '1rem', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '0.45rem 1rem', borderRadius: 4,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={handleCreate} disabled={!title.trim() || saving} style={{
            padding: '0.45rem 1rem', borderRadius: 4,
            background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.4)',
            color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Criando…' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MapTab ────────────────────────────────────────────────────────────────────

export function MapTab({ campaign }: MapTabProps) {
  const { user } = useAuth()
  const [map, setMap] = useState<GameMap | null>(null)
  const [tokens, setTokens] = useState<MapToken[]>([])
  const [loading, setLoading] = useState(true)
  const [tool, setTool] = useState<MapTool>('select')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  // Throttle state for TOKEN_MOVE broadcasts during drag
  const lastDragBroadcastRef = useRef(0)

  const allChars = [...campaign.players, ...campaign.npcs]

  // Measure canvas container
  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ w: rect.width, h: rect.height })
    }
    const obs = new ResizeObserver(entries => {
      const e = entries[0]
      if (e) setContainerSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Load active map + tokens on mount
  useEffect(() => {
    setLoading(true)
    api.maps.getActive(campaign.id)
      .then(res => {
        const m = res.map as GameMap | null
        setMap(m)
        if (m?.tokens) setTokens(m.tokens)
      })
      .catch(() => setMap(null))
      .finally(() => setLoading(false))
  }, [campaign.id])

  // ── Realtime: map-level events (token moves, layer changes) ─────────────────
  const broadcastMap = useMapRealtime(map?.id, {
    selfId: user?.id,
    onTokenMove: useCallback((tokenId, x, y) => {
      setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, x, y } : t))
    }, []),

    onTokenAdd: useCallback((token: MapToken) => {
      setTokens(prev => prev.some(t => t.id === token.id) ? prev : [...prev, token])
    }, []),

    onTokenRemove: useCallback((tokenId: string) => {
      setTokens(prev => prev.filter(t => t.id !== tokenId))
    }, []),

    onLayerChange: useCallback((_layerId, layers) => {
      setMap(prev => prev ? { ...prev, layers } : prev)
    }, []),
  })

  // ── Realtime: campaign-level events (map activated / deactivated) ───────────
  const broadcastCampaign = useCampaignMapChannel(campaign.id, {
    onMapActivated: useCallback((newMap: GameMap) => {
      setMap(newMap)
      setTokens(newMap.tokens ?? [])
    }, []),

    onMapDeactivated: useCallback(() => {
      setMap(null)
      setTokens([])
    }, []),
  })

  // ── Token drag: throttled broadcast (no DB write) ───────────────────────────
  const handleTokenDrag = useCallback((tokenId: string, x: number, y: number) => {
    const now = Date.now()
    if (now - lastDragBroadcastRef.current < TOKEN_DRAG_THROTTLE_MS) return
    lastDragBroadcastRef.current = now
    broadcastMap({ type: 'TOKEN_MOVE', tokenId, x, y, senderId: user?.id })
  }, [broadcastMap, user?.id])

  // ── Token drag end: update state + DB + broadcast final position ────────────
  const handleTokenMove = useCallback(async (tokenId: string, x: number, y: number) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, x, y } : t))
    broadcastMap({ type: 'TOKEN_MOVE', tokenId, x, y, senderId: user?.id })
    try {
      await api.maps.updateToken(campaign.id, map!.id, tokenId, { x, y })
    } catch {
      // revert handled by next full load
    }
  }, [campaign.id, map, broadcastMap])

  // ── Handlers passed to panels so they can broadcast after mutations ─────────
  const handleMapBroadcast = useCallback((event: MapBroadcastEvent) => {
    broadcastMap({ ...event, senderId: user?.id })
  }, [broadcastMap, user?.id])

  // ── CreateMapModal callback: activate + broadcast to campaign channel ────────
  const handleMapCreated = useCallback(async (newMap: GameMap) => {
    setMap(newMap)
    setShowCreateModal(false)
    // Load tokens (empty for a new map)
    setTokens([])
    broadcastCampaign({ type: 'MAP_ACTIVATED', map: newMap })
  }, [broadcastCampaign])

  const activeLayer = map?.layers.find(l => l.isActive) ?? null

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#04060C' }}>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>Carregando…</p>
      </div>
    )
  }

  if (!map) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#04060C' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>
          Nenhum mapa ativo
        </p>
        {campaign.isGm && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: 4,
              background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.35)',
              color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Criar mapa
          </button>
        )}
        {!campaign.isGm && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            O mestre não ativou um mapa ainda.
          </p>
        )}
        {showCreateModal && (
          <CreateMapModal
            campaignId={campaign.id}
            onCreated={handleMapCreated}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#04060C' }}>
      {/* Toolbar (master only) */}
      {campaign.isGm && (
        <MapToolbar tool={tool} onToolChange={setTool} />
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Side panel (master only) */}
        {campaign.isGm && (
          <>
            {/* Desktop panel */}
            <div className="hidden lg:flex" style={{
              width: 220, flexShrink: 0,
              background: 'rgba(6,10,22,0.9)',
              borderRight: '1px solid var(--color-border)',
              flexDirection: 'column', gap: '1rem',
              padding: '1rem 0.75rem',
              overflowY: 'auto',
            }}>
              <MapLayerPanel
                campaignId={campaign.id}
                map={map}
                onMapChange={setMap}
                onBroadcast={handleMapBroadcast}
              />
              <div style={{ height: 1, background: 'var(--color-border)' }} />
              <MapTokenPanel
                campaignId={campaign.id}
                map={map}
                tokens={tokens}
                allChars={allChars}
                onTokensChange={setTokens}
                onBroadcast={handleMapBroadcast}
              />
            </div>

            {/* Mobile panel toggle */}
            <button
              className="lg:hidden"
              onClick={() => setPanelOpen(v => !v)}
              style={{
                position: 'absolute', bottom: 80, right: 16, zIndex: 10,
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(200,146,42,0.2)', border: '1px solid rgba(200,146,42,0.4)',
                color: 'var(--color-arcano)', fontSize: '1.1rem', cursor: 'pointer',
              }}
            >
              ☰
            </button>

            {/* Mobile drawer */}
            {panelOpen && (
              <div
                onClick={() => setPanelOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)' }}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 260,
                    background: 'var(--color-deep)', borderRight: '1px solid var(--color-border)',
                    padding: '1rem 0.75rem', overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                  }}
                >
                  <MapLayerPanel
                    campaignId={campaign.id}
                    map={map}
                    onMapChange={m => { setMap(m); setPanelOpen(false) }}
                    onBroadcast={handleMapBroadcast}
                  />
                  <div style={{ height: 1, background: 'var(--color-border)' }} />
                  <MapTokenPanel
                    campaignId={campaign.id}
                    map={map}
                    tokens={tokens}
                    allChars={allChars}
                    onTokensChange={t => { setTokens(t); setPanelOpen(false) }}
                    onBroadcast={handleMapBroadcast}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Canvas area */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeLayer ? (
            <MapCanvas
              map={map}
              activeLayer={activeLayer}
              tokens={tokens}
              tool={tool}
              isGm={campaign.isGm}
              containerWidth={containerSize.w}
              containerHeight={containerSize.h}
              onTokenDrag={handleTokenDrag}
              onTokenMove={handleTokenMove}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {campaign.isGm ? 'Adicione uma layer para começar.' : 'Aguardando o mestre ativar uma layer.'}
              </p>
            </div>
          )}

          {/* Layer indicator */}
          {activeLayer && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              padding: '0.3rem 0.75rem', borderRadius: 99,
              background: 'rgba(4,6,12,0.85)', border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
            }}>
              {map.title} — {activeLayer.name}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateMapModal
          campaignId={campaign.id}
          onCreated={handleMapCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
