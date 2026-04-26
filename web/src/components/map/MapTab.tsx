import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/authContext'
import { useMapRealtime, useCampaignMapChannel } from '@/hooks/useMapRealtime'
import type { MapBroadcastEvent } from '@/hooks/useMapRealtime'
import type { CampaignDetail } from '@/data/campaignTypes'
import type { GameMap, MapToken, MapTool, FogPatch, MapWall, MapDoor, MapSummary } from '@/lib/mapTypes'
import { computeVisibilityPolygon } from '@/lib/fogOfWar'
import { MapCanvas } from './MapCanvas'
import { MapToolbar } from './MapToolbar'
import { MapLayerPanel } from './MapLayerPanel'
import { MapTokenPanel } from './MapTokenPanel'
import { MapTokenModal } from './MapTokenModal'
import { MapSettingsPanel } from './MapSettingsPanel'
import { MapListPanel } from './MapListPanel'

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
  const [fogEnabled, setFogEnabled] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMapList, setShowMapList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [allMaps, setAllMaps] = useState<MapSummary[]>([])
  const [allMapsLoading, setAllMapsLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  const lastDragBroadcastRef = useRef(0)
  const localFogPatchesRef = useRef<FogPatch[]>([])
  const currentDragTokenRef = useRef<string | null>(null)
  const [activeDrag, setActiveDrag] = useState<{ tokenId: string; x: number; y: number } | null>(null)
  const [localFogPatches, setLocalFogPatches] = useState<FogPatch[]>([])

  const allChars = [...campaign.players, ...campaign.npcs]
  const myCharacterIds = campaign.isGm
    ? []
    : campaign.players.filter(c => c.userId === user?.id).map(c => c.id)
  const npcCharacterIds = campaign.npcs.map(c => c.id)

  // GM's current layer (isActive flag)
  const gmCurrentLayerId = map?.layers.find(l => l.isActive)?.id ?? null
  const gmCurrentLayer = gmCurrentLayerId ? map?.layers.find(l => l.id === gmCurrentLayerId) ?? null : null

  // Player's effective current layer: highest-floor layer where they have an own or shared token
  const effectiveCurrentLayerId = useMemo(() => {
    if (campaign.isGm || !map) return gmCurrentLayerId
    const sorted = [...map.layers].sort((a, b) => a.orderIndex - b.orderIndex)
    for (let i = sorted.length - 1; i >= 0; i--) {
      const hasAccess = tokens.some(t =>
        t.layerId === sorted[i].id &&
        (myCharacterIds.includes(t.characterId) || (user?.id != null && t.sharedWith.includes(user.id))),
      )
      if (hasAccess) return sorted[i].id
    }
    return gmCurrentLayerId
  }, [campaign.isGm, gmCurrentLayerId, map, tokens, myCharacterIds, user?.id])

  const fogStateRef = useRef({ fogEnabled, map, tokens, npcCharacterIds, gmCurrentLayerId })
  fogStateRef.current = { fogEnabled, map, tokens, npcCharacterIds, gmCurrentLayerId }

  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) setContainerSize({ w: rect.width, h: rect.height })
    const obs = new ResizeObserver(entries => {
      const e = entries[0]
      if (e) setContainerSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setLoading(true)
    api.maps.getActive(campaign.id)
      .then(res => {
        const m = res.map as GameMap | null
        setMap(m)
        if (m?.tokens) setTokens(m.tokens)
        if (m) setFogEnabled(m.fogEnabled)
      })
      .catch(() => setMap(null))
      .finally(() => setLoading(false))
  }, [campaign.id])

  // ── Realtime ─────────────────────────────────────────────────────────────────
  const broadcastMap = useMapRealtime(map?.id, {
    selfId: user?.id,
    onTokenMove: useCallback((tokenId, x, y) => {
      setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, x, y } : t))
    }, []),

    onTokenUpdate: useCallback((tokenId, data) => {
      setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, ...data } : t))
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

    onFogUpdate: useCallback((enabled: boolean, layerId: string | null, revealed: FogPatch[]) => {
      setFogEnabled(enabled)
      if (layerId) {
        setMap(prev => prev ? {
          ...prev,
          layers: prev.layers.map(l => l.id === layerId ? { ...l, fogRevealed: revealed } : l),
        } : prev)
      }
    }, []),

    onDoorAdd: useCallback((door: MapDoor) => {
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === door.layerId ? { ...l, doors: [...(l.doors ?? []), door] } : l),
      } : prev)
    }, []),

    onDoorDelete: useCallback((doorId: string, layerId: string) => {
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === layerId ? { ...l, doors: (l.doors ?? []).filter(d => d.id !== doorId) } : l),
      } : prev)
    }, []),

    onDoorToggle: useCallback((door: MapDoor) => {
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === door.layerId
          ? { ...l, doors: (l.doors ?? []).map(d => d.id === door.id ? door : d) }
          : l),
      } : prev)
    }, []),

    onSettingsUpdate: useCallback((settings: { title: string; gridEnabled: boolean; gridSize: number; defaultVisionRadius: number; visionUnified: boolean }) => {
      setMap(prev => prev ? { ...prev, ...settings } : prev)
    }, []),
  })

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

  // ── Token drag: throttled broadcast + fog trail ───────────────────────────────
  const handleTokenDrag = useCallback((tokenId: string, x: number, y: number) => {
    const now = Date.now()
    if (now - lastDragBroadcastRef.current < TOKEN_DRAG_THROTTLE_MS) return
    lastDragBroadcastRef.current = now

    if (currentDragTokenRef.current !== tokenId) {
      localFogPatchesRef.current = []
      currentDragTokenRef.current = tokenId
    }

    setActiveDrag({ tokenId, x, y })
    broadcastMap({ type: 'TOKEN_MOVE', tokenId, x, y, senderId: user?.id })

    const { fogEnabled: fe, map: m, tokens: toks, npcCharacterIds: npcIds } = fogStateRef.current
    if (fe && m) {
      const token = toks.find(t => t.id === tokenId)
      if (token && !npcIds.includes(token.characterId)) {
        const tokenLayer = m.layers.find(l => l.id === token.layerId)
        if (tokenLayer) {
          const radius = token.visionRadius ?? m.defaultVisionRadius
          const closedDoors = (tokenLayer.doors ?? []).filter(d => !d.isOpen)
          const blockingWalls = [
            ...(tokenLayer.walls ?? []),
            ...closedDoors.map(d => ({ id: d.id, mapId: d.mapId, layerId: d.layerId, points: d.points })),
          ]
          const polygon = computeVisibilityPolygon({ x, y }, radius, blockingWalls)
          localFogPatchesRef.current.push({ x, y, radius, polygon, characterId: token.characterId })
          setLocalFogPatches([...localFogPatchesRef.current])
        }
      }
    }
  }, [broadcastMap, user?.id])

  // ── Token drag end: persist fog + update state ────────────────────────────────
  const handleTokenMove = useCallback(async (tokenId: string, x: number, y: number) => {
    const pendingPatches = [...localFogPatchesRef.current]
    localFogPatchesRef.current = []
    currentDragTokenRef.current = null
    setActiveDrag(null)
    setLocalFogPatches([])

    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, x, y } : t))
    broadcastMap({ type: 'TOKEN_MOVE', tokenId, x, y, senderId: user?.id })
    try {
      await api.maps.updateToken(campaign.id, map!.id, tokenId, { x, y })

      if (fogEnabled) {
        const token = tokens.find(t => t.id === tokenId)
        if (token && !npcCharacterIds.includes(token.characterId)) {
          const tokenLayer = map!.layers.find(l => l.id === token.layerId)
          if (tokenLayer) {
            const radius = token.visionRadius ?? map!.defaultVisionRadius
            const closedDoors = (tokenLayer.doors ?? []).filter(d => !d.isOpen)
            const blockingWalls = [
              ...(tokenLayer.walls ?? []),
              ...closedDoors.map(d => ({ id: d.id, mapId: d.mapId, layerId: d.layerId, points: d.points })),
            ]
            const polygon = computeVisibilityPolygon({ x, y }, radius, blockingWalls)
            const allNewPatches = pendingPatches.length > 0
              ? [...pendingPatches, { x, y, radius, polygon, characterId: token.characterId }]
              : [{ x, y, radius, polygon, characterId: token.characterId }]
            const existing = tokenLayer.fogRevealed ?? []
            const next = [...existing, ...allNewPatches]
            setMap(prev => prev ? {
              ...prev,
              layers: prev.layers.map(l => l.id === tokenLayer.id ? { ...l, fogRevealed: next } : l),
            } : prev)
            await api.maps.addFogPatches(map!.campaignId, map!.id, tokenLayer.id, allNewPatches)
            broadcastMap({ type: 'FOG_UPDATE', fogEnabled, layerId: tokenLayer.id, fogRevealed: next, senderId: user?.id })
          }
        }
      }
    } catch {
      // revert handled by next full load
    }
  }, [campaign.id, map, fogEnabled, tokens, npcCharacterIds, broadcastMap, user?.id])

  // ── Fog handlers ──────────────────────────────────────────────────────────────
  const handleFogToggle = useCallback(async () => {
    if (!map) return
    const next = !fogEnabled
    setFogEnabled(next)
    try {
      await api.maps.updateFog(map.campaignId, map.id, next)
      broadcastMap({ type: 'FOG_UPDATE', fogEnabled: next, layerId: null, fogRevealed: [], senderId: user?.id })
    } catch { setFogEnabled(fogEnabled) }
  }, [map, fogEnabled, broadcastMap, user?.id])

  const handleFogReveal = useCallback(async (patch: FogPatch) => {
    if (!map || !gmCurrentLayer) return
    const polygon = computeVisibilityPolygon({ x: patch.x, y: patch.y }, patch.radius, gmCurrentLayer.walls ?? [])
    const patchWithPoly = { ...patch, polygon }
    const existing = gmCurrentLayer.fogRevealed ?? []
    const next = [...existing, patchWithPoly]
    setMap(prev => prev ? {
      ...prev,
      layers: prev.layers.map(l => l.id === gmCurrentLayer.id ? { ...l, fogRevealed: next } : l),
    } : prev)
    try {
      await api.maps.addFogPatches(map.campaignId, map.id, gmCurrentLayer.id, [patchWithPoly])
      broadcastMap({ type: 'FOG_UPDATE', fogEnabled, layerId: gmCurrentLayer.id, fogRevealed: next, senderId: user?.id })
    } catch {
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === gmCurrentLayer.id ? { ...l, fogRevealed: existing } : l),
      } : prev)
    }
  }, [map, gmCurrentLayer, fogEnabled, broadcastMap, user?.id])

  const handleFogReset = useCallback(async () => {
    if (!map || !gmCurrentLayer) return
    setMap(prev => prev ? {
      ...prev,
      layers: prev.layers.map(l => l.id === gmCurrentLayer.id ? { ...l, fogRevealed: [] } : l),
    } : prev)
    try {
      await api.maps.resetFog(map.campaignId, map.id, gmCurrentLayer.id)
      broadcastMap({ type: 'FOG_UPDATE', fogEnabled, layerId: gmCurrentLayer.id, fogRevealed: [], senderId: user?.id })
    } catch { /* stay optimistic */ }
  }, [map, gmCurrentLayer, fogEnabled, broadcastMap, user?.id])

  // ── Wall handlers ─────────────────────────────────────────────────────────────
  const handleWallAdd = useCallback(async (points: Array<{ x: number; y: number }>) => {
    if (!map || !gmCurrentLayer) return
    try {
      const res = await api.maps.createWall(map.campaignId, map.id, gmCurrentLayer.id, points)
      const wall = res.wall as MapWall
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === gmCurrentLayer.id
          ? { ...l, walls: [...(l.walls ?? []), wall] }
          : l),
      } : prev)
    } catch (err) {
      alert((err as Error).message)
    }
  }, [map, gmCurrentLayer])

  const handleWallDelete = useCallback(async (wallId: string) => {
    if (!map || !gmCurrentLayer) return
    setMap(prev => prev ? {
      ...prev,
      layers: prev.layers.map(l => l.id === gmCurrentLayer.id
        ? { ...l, walls: (l.walls ?? []).filter(w => w.id !== wallId) }
        : l),
    } : prev)
    try {
      await api.maps.deleteWall(map.campaignId, map.id, gmCurrentLayer.id, wallId)
    } catch { /* keep optimistic */ }
  }, [map, gmCurrentLayer])

  // ── Door handlers ─────────────────────────────────────────────────────────────
  const handleDoorAdd = useCallback(async (points: Array<{ x: number; y: number }>) => {
    if (!map || !gmCurrentLayer) return
    try {
      const res = await api.maps.createDoor(map.campaignId, map.id, gmCurrentLayer.id, points)
      const door = res.door as MapDoor
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === gmCurrentLayer.id
          ? { ...l, doors: [...(l.doors ?? []), door] }
          : l),
      } : prev)
      broadcastMap({ type: 'DOOR_ADD', door, senderId: user?.id })
    } catch (err) {
      alert((err as Error).message)
    }
  }, [map, gmCurrentLayer, broadcastMap, user?.id])

  const handleDoorDelete = useCallback(async (doorId: string) => {
    if (!map || !gmCurrentLayer) return
    setMap(prev => prev ? {
      ...prev,
      layers: prev.layers.map(l => l.id === gmCurrentLayer.id
        ? { ...l, doors: (l.doors ?? []).filter(d => d.id !== doorId) }
        : l),
    } : prev)
    broadcastMap({ type: 'DOOR_DELETE', doorId, layerId: gmCurrentLayer.id, senderId: user?.id })
    try {
      await api.maps.deleteDoor(map.campaignId, map.id, gmCurrentLayer.id, doorId)
    } catch { /* keep optimistic */ }
  }, [map, gmCurrentLayer, broadcastMap, user?.id])

  const handleDoorToggle = useCallback(async (doorId: string) => {
    if (!map || !gmCurrentLayer) return
    try {
      const res = await api.maps.toggleDoor(map.campaignId, map.id, gmCurrentLayer.id, doorId)
      const door = res.door as MapDoor
      setMap(prev => prev ? {
        ...prev,
        layers: prev.layers.map(l => l.id === gmCurrentLayer.id
          ? { ...l, doors: (l.doors ?? []).map(d => d.id === doorId ? door : d) }
          : l),
      } : prev)
      broadcastMap({ type: 'DOOR_TOGGLE', door, senderId: user?.id })
    } catch (err) {
      alert((err as Error).message)
    }
  }, [map, gmCurrentLayer, broadcastMap, user?.id])

  // ── Token drop from panel onto canvas ────────────────────────────────────────
  const handleTokenDrop = useCallback(async (charId: string, worldX: number, worldY: number, visionRadius: number | null) => {
    if (!map || !gmCurrentLayer) return
    try {
      const res = await api.maps.createToken(campaign.id, map.id, {
        layer_id: gmCurrentLayer.id,
        character_id: charId,
        x: worldX, y: worldY,
        vision_radius: visionRadius,
      }) as { token: MapToken; removedTokenId: string | null; removedTokenMapId: string | null }

      // Evict old token from state if it was on this map
      if (res.removedTokenId && res.removedTokenMapId === map.id) {
        setTokens(prev => prev.filter(t => t.id !== res.removedTokenId))
        broadcastMap({ type: 'TOKEN_REMOVE', tokenId: res.removedTokenId, senderId: user?.id })
      }

      const newToken = res.token
      setTokens(prev => prev.some(t => t.id === newToken.id) ? prev : [...prev, newToken])
      broadcastMap({ type: 'TOKEN_ADD', token: newToken, senderId: user?.id })

      if (fogEnabled && !npcCharacterIds.includes(charId)) {
        const radius = newToken.visionRadius ?? map.defaultVisionRadius
        const polygon = computeVisibilityPolygon({ x: worldX, y: worldY }, radius, gmCurrentLayer.walls ?? [])
        const patchWithPoly = { x: worldX, y: worldY, radius, polygon, characterId: charId }
        const existing = gmCurrentLayer.fogRevealed ?? []
        const next = [...existing, patchWithPoly]
        setMap(prev => prev ? {
          ...prev,
          layers: prev.layers.map(l => l.id === gmCurrentLayer.id ? { ...l, fogRevealed: next } : l),
        } : prev)
        await api.maps.addFogPatches(map.campaignId, map.id, gmCurrentLayer.id, [patchWithPoly])
        broadcastMap({ type: 'FOG_UPDATE', fogEnabled, layerId: gmCurrentLayer.id, fogRevealed: next, senderId: user?.id })
      }
    } catch (err) {
      alert((err as Error).message)
    }
  }, [map, campaign.id, gmCurrentLayer, fogEnabled, npcCharacterIds, broadcastMap, user?.id])

  // ── Token modal ───────────────────────────────────────────────────────────────
  const [modalToken, setModalToken] = useState<MapToken | null>(null)

  const handleTokenEdit = useCallback((tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId)
    if (token) setModalToken(token)
  }, [tokens])

  const handleVisionUpdate = useCallback(async (tokenId: string, visionRadius: number | null) => {
    if (!map) return
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, visionRadius } : t))
    broadcastMap({ type: 'TOKEN_UPDATE', tokenId, data: { visionRadius }, senderId: user?.id })
    try {
      await api.maps.updateToken(campaign.id, map.id, tokenId, { vision_radius: visionRadius })
    } catch { /* keep optimistic */ }
  }, [map, campaign.id, broadcastMap, user?.id])

  const handleShareUpdate = useCallback(async (tokenId: string, sharedWith: string[]) => {
    if (!map) return
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, sharedWith } : t))
    broadcastMap({ type: 'TOKEN_UPDATE', tokenId, data: { sharedWith }, senderId: user?.id })
    try {
      await api.maps.updateToken(campaign.id, map.id, tokenId, { shared_with: sharedWith })
    } catch { /* keep optimistic */ }
  }, [map, campaign.id, broadcastMap, user?.id])

  const handleTokenResize = useCallback(async (tokenId: string, size: number) => {
    if (!map) return
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, size } : t))
    broadcastMap({ type: 'TOKEN_UPDATE', tokenId, data: { size }, senderId: user?.id })
    try {
      await api.maps.updateToken(campaign.id, map.id, tokenId, { size })
    } catch { /* keep optimistic */ }
  }, [map, campaign.id, broadcastMap, user?.id])

  const handleMapBroadcast = useCallback((event: MapBroadcastEvent) => {
    broadcastMap({ ...event, senderId: user?.id })
  }, [broadcastMap, user?.id])

  const handleLayerDelete = useCallback((layerId: string) => {
    setTokens(prev => {
      const removed = prev.filter(t => t.layerId === layerId)
      removed.forEach(t => broadcastMap({ type: 'TOKEN_REMOVE', tokenId: t.id, senderId: user?.id }))
      return prev.filter(t => t.layerId !== layerId)
    })
  }, [broadcastMap, user?.id])

  const handleMapCreated = useCallback(async (newMap: GameMap) => {
    setMap(newMap)
    setShowCreateModal(false)
    setTokens([])
    setAllMaps(prev => [...prev.map(m => ({ ...m, isActive: false })), { ...newMap, tokens: [], isActive: true }])
    broadcastCampaign({ type: 'MAP_ACTIVATED', map: newMap })
  }, [broadcastCampaign])

  // ── Map list ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showMapList || !campaign.isGm) return
    setAllMapsLoading(true)
    api.maps.list(campaign.id)
      .then(res => setAllMaps(res.maps ?? []))
      .catch(() => {})
      .finally(() => setAllMapsLoading(false))
  }, [showMapList, campaign.id, campaign.isGm])

  const handleMapSwitch = useCallback(async (mapId: string) => {
    try {
      await api.maps.activate(campaign.id, mapId)
      const res = await api.maps.getActive(campaign.id)
      const newMap = res.map as GameMap
      setMap(newMap)
      setTokens(newMap.tokens ?? [])
      setFogEnabled(newMap.fogEnabled)
      setAllMaps(prev => prev.map(m => ({ ...m, isActive: m.id === mapId } as MapSummary)))
      broadcastCampaign({ type: 'MAP_ACTIVATED', map: newMap })
    } catch (err) {
      alert((err as Error).message)
    }
  }, [campaign.id, broadcastCampaign])

  const handleMapDelete = useCallback(async (mapId: string) => {
    if (!confirm('Deletar este mapa permanentemente?')) return
    const wasActive = map?.id === mapId
    try {
      await api.maps.delete(campaign.id, mapId)
      setAllMaps(prev => prev.filter(m => m.id !== mapId))
      if (wasActive) {
        setMap(null)
        setTokens([])
        broadcastCampaign({ type: 'MAP_DEACTIVATED' })
      }
    } catch (err) {
      alert((err as Error).message)
    }
  }, [campaign.id, map?.id, broadcastCampaign])

  const handleSettingsSave = useCallback((updated: GameMap) => {
    setMap(prev => prev ? { ...prev, ...updated } : prev)
    setAllMaps(prev => prev.map(m => m.id === updated.id ? { ...m, title: updated.title } : m))
    setShowSettings(false)
    broadcastMap({
      type: 'MAP_SETTINGS_UPDATE',
      title: updated.title,
      gridEnabled: updated.gridEnabled,
      gridSize: updated.gridSize,
      defaultVisionRadius: updated.defaultVisionRadius,
      visionUnified: updated.visionUnified,
      senderId: user?.id,
    })
  }, [broadcastMap, user?.id])

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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <button
              onClick={() => setShowMapList(true)}
              style={{
                padding: '0.65rem 1.5rem', borderRadius: 4,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              🗺 Ver mapas
            </button>
          </div>
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
        {showMapList && campaign.isGm && (
          <MapListPanel
            maps={allMaps}
            activeMapId={null}
            loading={allMapsLoading}
            onSwitch={handleMapSwitch}
            onDelete={handleMapDelete}
            onSettings={() => {}}
            onCreate={() => { setShowMapList(false); setShowCreateModal(true) }}
            onClose={() => setShowMapList(false)}
          />
        )}
      </div>
    )
  }

  const hasLayers = map.layers.length > 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#04060C' }}>
      {campaign.isGm && (
        <MapToolbar
          tool={tool}
          onToolChange={setTool}
          fogEnabled={fogEnabled}
          onFogToggle={handleFogToggle}
          onFogReset={handleFogReset}
          onMapList={() => setShowMapList(true)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {campaign.isGm && (
          <>
            {/* Desktop panel */}
            <div className="hidden lg:flex" style={{
              width: 220, flexShrink: 0,
              background: 'rgba(6,10,22,0.9)',
              borderRight: '1px solid var(--color-border)',
              flexDirection: 'column', gap: '1rem',
              padding: '1rem 0.75rem', overflowY: 'auto',
            }}>
              <MapLayerPanel
                campaignId={campaign.id}
                map={map}
                onMapChange={setMap}
                onBroadcast={handleMapBroadcast}
                onLayerDelete={handleLayerDelete}
              />
              <div style={{ height: 1, background: 'var(--color-border)' }} />
              <MapTokenPanel
                campaignId={campaign.id}
                map={map}
                tokens={tokens}
                allChars={allChars}
                onTokensChange={setTokens}
                onBroadcast={handleMapBroadcast}
                onTokenEdit={handleTokenEdit}
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
                    onLayerDelete={handleLayerDelete}
                  />
                  <div style={{ height: 1, background: 'var(--color-border)' }} />
                  <MapTokenPanel
                    campaignId={campaign.id}
                    map={map}
                    tokens={tokens}
                    allChars={allChars}
                    onTokensChange={t => { setTokens(t); setPanelOpen(false) }}
                    onBroadcast={handleMapBroadcast}
                    onTokenEdit={handleTokenEdit}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Canvas area */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {hasLayers ? (
            <MapCanvas
              map={map}
              allLayers={map.layers}
              currentLayerId={effectiveCurrentLayerId}
              tokens={tokens}
              tool={tool}
              isGm={campaign.isGm}
              containerWidth={containerSize.w}
              containerHeight={containerSize.h}
              fogEnabled={fogEnabled}
              userId={user?.id}
              myCharacterIds={myCharacterIds}
              npcCharacterIds={npcCharacterIds}
              dragOverride={activeDrag}
              localFogPatches={localFogPatches}
              onTokenDrag={handleTokenDrag}
              onTokenMove={handleTokenMove}
              onTokenResize={handleTokenResize}
              onTokenEdit={handleTokenEdit}
              onTokenDrop={handleTokenDrop}
              onFogReveal={handleFogReveal}
              onWallAdd={handleWallAdd}
              onWallDelete={handleWallDelete}
              onDoorAdd={handleDoorAdd}
              onDoorDelete={handleDoorDelete}
              onDoorToggle={handleDoorToggle}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {campaign.isGm ? 'Adicione uma layer para começar.' : 'Aguardando o mestre.'}
              </p>
            </div>
          )}

          {/* Layer indicator */}
          {gmCurrentLayer && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              padding: '0.3rem 0.75rem', borderRadius: 99,
              background: 'rgba(4,6,12,0.85)', border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
            }}>
              {map.title} — {gmCurrentLayer.name}
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

      {showMapList && campaign.isGm && (
        <MapListPanel
          maps={allMaps}
          activeMapId={map.id}
          loading={allMapsLoading}
          onSwitch={handleMapSwitch}
          onDelete={handleMapDelete}
          onSettings={() => { setShowMapList(false); setShowSettings(true) }}
          onCreate={() => { setShowMapList(false); setShowCreateModal(true) }}
          onClose={() => setShowMapList(false)}
        />
      )}

      {showSettings && campaign.isGm && (
        <MapSettingsPanel
          campaignId={campaign.id}
          map={map}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      {modalToken && (
        <MapTokenModal
          character={modalToken.character}
          visionRadius={modalToken.visionRadius}
          sharedWith={modalToken.sharedWith}
          map={map}
          players={campaign.players}
          onSave={(vr) => handleVisionUpdate(modalToken.id, vr)}
          onShareUpdate={(sw) => handleShareUpdate(modalToken.id, sw)}
          onClose={() => setModalToken(null)}
        />
      )}
    </div>
  )
}
