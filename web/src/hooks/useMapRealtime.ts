import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'
import type { GameMap, MapLayer, MapToken, FogPatch } from '@/lib/mapTypes'

// ── Broadcast event types ─────────────────────────────────────────────────────

export type MapBroadcastEvent =
  | { type: 'TOKEN_MOVE'; tokenId: string; x: number; y: number; senderId?: string }
  | { type: 'TOKEN_ADD'; token: MapToken; senderId?: string }
  | { type: 'TOKEN_REMOVE'; tokenId: string; senderId?: string }
  | { type: 'LAYER_CHANGE'; layerId: string; layers: MapLayer[]; senderId?: string }
  | { type: 'FOG_UPDATE'; fogEnabled: boolean; layerId: string | null; fogRevealed: FogPatch[]; senderId?: string }

export type CampaignMapEvent =
  | { type: 'MAP_ACTIVATED'; map: GameMap }
  | { type: 'MAP_DEACTIVATED' }

// ── useMapRealtime ────────────────────────────────────────────────────────────
// Subscribes to map:{mapId} channel for in-session token/layer events.

interface MapRealtimeHandlers {
  selfId: string | undefined
  onTokenMove: (tokenId: string, x: number, y: number) => void
  onTokenAdd: (token: MapToken) => void
  onTokenRemove: (tokenId: string) => void
  onLayerChange: (layerId: string, layers: MapLayer[]) => void
  onFogUpdate: (fogEnabled: boolean, layerId: string | null, fogRevealed: FogPatch[]) => void
}

export function useMapRealtime(
  mapId: string | undefined,
  handlers: MapRealtimeHandlers,
): (event: MapBroadcastEvent) => void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!mapId) return

    const channel = supabase
      .channel(`map:${mapId}`)
      .on('broadcast', { event: 'TOKEN_MOVE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'TOKEN_MOVE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onTokenMove(p.tokenId, p.x, p.y)
      })
      .on('broadcast', { event: 'TOKEN_ADD' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'TOKEN_ADD' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onTokenAdd(p.token)
      })
      .on('broadcast', { event: 'TOKEN_REMOVE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'TOKEN_REMOVE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onTokenRemove(p.tokenId)
      })
      .on('broadcast', { event: 'LAYER_CHANGE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'LAYER_CHANGE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onLayerChange(p.layerId, p.layers)
      })
      .on('broadcast', { event: 'FOG_UPDATE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'FOG_UPDATE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onFogUpdate(p.fogEnabled, p.layerId, p.fogRevealed)
      })
      .subscribe()

    channelRef.current = channel
    return () => { void supabase.removeChannel(channel) }
  }, [mapId])

  const broadcast = useCallback((event: MapBroadcastEvent) => {
    void channelRef.current?.send({ type: 'broadcast', event: event.type, payload: event })
  }, [])

  return broadcast
}

// ── useCampaignMapChannel ─────────────────────────────────────────────────────
// Subscribes to campaign:{campaignId}:map for map lifecycle events
// (activate / deactivate). Keeps players in sync when the GM switches maps.

interface CampaignMapHandlers {
  onMapActivated: (map: GameMap) => void
  onMapDeactivated: () => void
}

export function useCampaignMapChannel(
  campaignId: string,
  handlers: CampaignMapHandlers,
): (event: CampaignMapEvent) => void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(`campaign:${campaignId}:map`)
      .on('broadcast', { event: 'MAP_ACTIVATED' }, ({ payload }) => {
        const p = payload as CampaignMapEvent
        if (p.type === 'MAP_ACTIVATED') handlersRef.current.onMapActivated(p.map)
      })
      .on('broadcast', { event: 'MAP_DEACTIVATED' }, () => {
        handlersRef.current.onMapDeactivated()
      })
      .subscribe()

    channelRef.current = channel
    return () => { void supabase.removeChannel(channel) }
  }, [campaignId])

  const broadcast = useCallback((event: CampaignMapEvent) => {
    void channelRef.current?.send({ type: 'broadcast', event: event.type, payload: event })
  }, [])

  return broadcast
}
