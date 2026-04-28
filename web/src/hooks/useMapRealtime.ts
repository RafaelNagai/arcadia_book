import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'
import type { GameMap, MapLayer, MapToken, MapDoor, FogPatch, Measurement, CreatureInstance } from '@/lib/mapTypes'

// ── Broadcast event types ─────────────────────────────────────────────────────

export type MapBroadcastEvent =
  | { type: 'TOKEN_MOVE'; tokenId: string; x: number; y: number; senderId?: string }
  | { type: 'TOKEN_UPDATE'; tokenId: string; data: { size?: number; isVisible?: boolean; visionRadius?: number | null; sharedWith?: string[] }; senderId?: string }
  | { type: 'TOKEN_ADD'; token: MapToken; senderId?: string }
  | { type: 'TOKEN_REMOVE'; tokenId: string; senderId?: string }
  | { type: 'LAYER_CHANGE'; layerId: string; layers: MapLayer[]; senderId?: string }
  | { type: 'FOG_UPDATE'; fogEnabled: boolean; layerId: string | null; fogRevealed: FogPatch[]; senderId?: string }
  | { type: 'DOOR_ADD'; door: MapDoor; senderId?: string }
  | { type: 'DOOR_DELETE'; doorId: string; layerId: string; senderId?: string }
  | { type: 'DOOR_TOGGLE'; door: MapDoor; senderId?: string }
  | { type: 'MAP_SETTINGS_UPDATE'; title: string; gridEnabled: boolean; gridSize: number; defaultVisionRadius: number; defaultTokenSize: number; visionUnified: boolean; allowPlayerTokenMove: boolean; allowPlayerDraw: boolean; senderId?: string }
  | { type: 'MEASUREMENT_LIVE'; measurement: Measurement; senderId?: string }
  | { type: 'MEASUREMENT_ADD'; measurement: Measurement; senderId?: string }
  | { type: 'MEASUREMENT_REMOVE'; userId: string; senderId?: string }
  | { type: 'MEASUREMENT_CLEAR_ALL'; senderId?: string }
  | { type: 'CREATURE_ADD'; instance: CreatureInstance; senderId?: string }
  | { type: 'CREATURE_REMOVE'; instanceId: string; senderId?: string }
  | { type: 'CREATURE_MOVE'; instanceId: string; x: number; y: number; senderId?: string }
  | { type: 'CREATURE_UPDATE'; instanceId: string; data: Partial<CreatureInstance>; senderId?: string }
  | { type: 'CREATURE_SYNC'; instances: CreatureInstance[]; senderId?: string }

export type CampaignMapEvent =
  | { type: 'MAP_ACTIVATED'; map: GameMap }
  | { type: 'MAP_DEACTIVATED' }
  | { type: 'FOCUS_ALL'; mapId: string; layerId: string; scale: number; panX: number; panY: number; senderId?: string }

// ── useMapRealtime ────────────────────────────────────────────────────────────

interface MapRealtimeHandlers {
  selfId: string | undefined
  onTokenMove: (tokenId: string, x: number, y: number) => void
  onTokenUpdate: (tokenId: string, data: { size?: number; isVisible?: boolean; visionRadius?: number | null; sharedWith?: string[] }) => void
  onTokenAdd: (token: MapToken) => void
  onTokenRemove: (tokenId: string) => void
  onLayerChange: (layerId: string, layers: MapLayer[]) => void
  onFogUpdate: (fogEnabled: boolean, layerId: string | null, fogRevealed: FogPatch[]) => void
  onDoorAdd: (door: MapDoor) => void
  onDoorDelete: (doorId: string, layerId: string) => void
  onDoorToggle: (door: MapDoor) => void
  onSettingsUpdate: (settings: { title: string; gridEnabled: boolean; gridSize: number; defaultVisionRadius: number; defaultTokenSize: number; visionUnified: boolean; allowPlayerTokenMove: boolean; allowPlayerDraw: boolean }) => void
  onMeasurementLive: (m: Measurement) => void
  onMeasurementAdd: (m: Measurement) => void
  onMeasurementRemove: (userId: string) => void
  onMeasurementClearAll: () => void
  onCreatureAdd: (instance: CreatureInstance) => void
  onCreatureRemove: (instanceId: string) => void
  onCreatureMove: (instanceId: string, x: number, y: number) => void
  onCreatureUpdate: (instanceId: string, data: Partial<CreatureInstance>) => void
  onCreatureSync: (instances: CreatureInstance[]) => void
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
      .on('broadcast', { event: 'TOKEN_UPDATE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'TOKEN_UPDATE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onTokenUpdate(p.tokenId, p.data)
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
      .on('broadcast', { event: 'DOOR_ADD' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'DOOR_ADD' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onDoorAdd(p.door)
      })
      .on('broadcast', { event: 'DOOR_DELETE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'DOOR_DELETE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onDoorDelete(p.doorId, p.layerId)
      })
      .on('broadcast', { event: 'DOOR_TOGGLE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'DOOR_TOGGLE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onDoorToggle(p.door)
      })
      .on('broadcast', { event: 'MAP_SETTINGS_UPDATE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'MAP_SETTINGS_UPDATE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onSettingsUpdate({
            title: p.title,
            gridEnabled: p.gridEnabled,
            gridSize: p.gridSize,
            defaultVisionRadius: p.defaultVisionRadius,
            defaultTokenSize: p.defaultTokenSize,
            visionUnified: p.visionUnified,
            allowPlayerTokenMove: p.allowPlayerTokenMove,
            allowPlayerDraw: p.allowPlayerDraw,
          })
      })
      .on('broadcast', { event: 'MEASUREMENT_LIVE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'MEASUREMENT_LIVE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onMeasurementLive(p.measurement)
      })
      .on('broadcast', { event: 'MEASUREMENT_ADD' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'MEASUREMENT_ADD' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onMeasurementAdd(p.measurement)
      })
      .on('broadcast', { event: 'MEASUREMENT_REMOVE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'MEASUREMENT_REMOVE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onMeasurementRemove(p.userId)
      })
      .on('broadcast', { event: 'MEASUREMENT_CLEAR_ALL' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'MEASUREMENT_CLEAR_ALL' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onMeasurementClearAll()
      })
      .on('broadcast', { event: 'CREATURE_ADD' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'CREATURE_ADD' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onCreatureAdd(p.instance)
      })
      .on('broadcast', { event: 'CREATURE_REMOVE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'CREATURE_REMOVE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onCreatureRemove(p.instanceId)
      })
      .on('broadcast', { event: 'CREATURE_MOVE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'CREATURE_MOVE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onCreatureMove(p.instanceId, p.x, p.y)
      })
      .on('broadcast', { event: 'CREATURE_UPDATE' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'CREATURE_UPDATE' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onCreatureUpdate(p.instanceId, p.data)
      })
      .on('broadcast', { event: 'CREATURE_SYNC' }, ({ payload }) => {
        const p = payload as MapBroadcastEvent
        if (p.type === 'CREATURE_SYNC' && p.senderId !== handlersRef.current.selfId)
          handlersRef.current.onCreatureSync(p.instances)
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

interface CampaignMapHandlers {
  onMapActivated: (map: GameMap) => void
  onMapDeactivated: () => void
  onFocusAll: (mapId: string, layerId: string, scale: number, panX: number, panY: number) => void
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
      .on('broadcast', { event: 'FOCUS_ALL' }, ({ payload }) => {
        const p = payload as CampaignMapEvent
        if (p.type === 'FOCUS_ALL') handlersRef.current.onFocusAll(p.mapId, p.layerId, p.scale, p.panX, p.panY)
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
