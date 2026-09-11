import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'

export type LayoutMode = 'spotlight' | 'gallery'

export type CampaignCallEvent =
  | { type: 'PARTICIPANT_JOIN'; userId: string; characterId: string | null; cloudflareSessionId: string; accountName: string; cameraEnabled: boolean; layoutMode: LayoutMode | null }
  | { type: 'PARTICIPANT_LEAVE'; userId: string }
  | { type: 'FORCE_MUTE'; targetUserId: string }
  | { type: 'FORCE_KICK'; targetUserId: string }

interface CallPresencePayload {
  userId: string
  characterId: string | null
  cloudflareSessionId: string
  accountName: string
  cameraEnabled: boolean
  layoutMode: LayoutMode | null
}

function payloadsEqual(a: CallPresencePayload, b: CallPresencePayload): boolean {
  return a.userId === b.userId
    && a.characterId === b.characterId
    && a.cloudflareSessionId === b.cloudflareSessionId
    && a.accountName === b.accountName
    && a.cameraEnabled === b.cameraEnabled
    && a.layoutMode === b.layoutMode
}

interface CampaignCallHandlers {
  selfId: string | undefined
  onParticipantUpdate: (userId: string, characterId: string | null, cloudflareSessionId: string, accountName: string, cameraEnabled: boolean, layoutMode: LayoutMode | null) => void
  onParticipantLeave: (userId: string) => void
  onForceMute: () => void
  onForceKick: () => void
}

type CallChannel = ReturnType<typeof supabase.channel>

// Extraída do handler de 'sync' para ser reaproveitada pelo re-sync de
// visibilitychange/online abaixo — mesma lógica de diff, uma só implementação.
function diffPresenceState(
  channel: CallChannel,
  selfId: string | undefined,
  knownPayloads: Map<string, CallPresencePayload>,
  handlers: CampaignCallHandlers,
) {
  const state = channel.presenceState<CallPresencePayload>()
  const currentKeys = new Set(Object.keys(state).filter(key => key !== selfId))

  const updatedKeys: string[] = []
  for (const key of currentKeys) {
    const latest = state[key][state[key].length - 1]
    if (!latest) continue
    const previous = knownPayloads.get(key)
    if (previous && payloadsEqual(previous, latest)) continue
    knownPayloads.set(key, latest)
    updatedKeys.push(key)
    handlers.onParticipantUpdate(latest.userId, latest.characterId, latest.cloudflareSessionId, latest.accountName, latest.cameraEnabled, latest.layoutMode)
  }
  const staleKeys = [...knownPayloads.keys()].filter(key => !currentKeys.has(key))
  for (const key of staleKeys) {
    knownPayloads.delete(key)
    handlers.onParticipantLeave(key)
  }
  return { currentKeys, updatedKeys, staleKeys }
}

// Presence (not broadcast) backs this hook: broadcast messages aren't replayed
// to clients that subscribe after they were sent, so a participant who joins
// the call after others would never discover who's already connected.
// Presence sync gives every subscriber the full current roster, which we diff
// against the last payload we've seen per key to derive updates either way —
// both a brand-new key and a re-`track()` of an already-known key (e.g. to
// propagate `cameraEnabled` changing mid-call) must reach `onParticipantUpdate`.
// FORCE_MUTE and FORCE_KICK ride a plain broadcast on this same channel:
// they're one-off directed actions, not state that needs to survive for
// someone joining later.
export function useCampaignCallChannel(
  campaignId: string,
  handlers: CampaignCallHandlers,
): (event: CampaignCallEvent) => void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const knownPayloadsRef = useRef<Map<string, CallPresencePayload>>(new Map())
  const selfId = handlers.selfId

  // DEBUG(call-kick-regression): temporary diagnostic logging for the "GM
  // leave doesn't kick players" investigation. All lines are tagged
  // "[call:presence]" — grep/remove them once a live repro (F12 on both
  // sides) pins down where the chain actually breaks.
  useEffect(() => {
    knownPayloadsRef.current = new Map()

    console.debug('[call:presence] channel created/recreated', { campaignId, selfId })

    const channel = supabase
      .channel(`campaign:${campaignId}:call`, { config: { presence: { key: selfId ?? crypto.randomUUID() } } })
      .on('presence', { event: 'sync' }, () => {
        const { currentKeys, updatedKeys, staleKeys } = diffPresenceState(channel, selfId, knownPayloadsRef.current, handlersRef.current)
        console.debug('[call:presence] sync received', {
          totalKeys: currentKeys.size,
          allKeys: [...currentKeys],
          updatedKeys,
          staleKeys,
        })
      })
      .on('broadcast', { event: 'force_mute' }, ({ payload }) => {
        if (payload?.targetUserId === selfId) handlersRef.current.onForceMute()
      })
      .on('broadcast', { event: 'force_kick' }, ({ payload }) => {
        if (payload?.targetUserId === selfId) handlersRef.current.onForceKick()
      })
      .subscribe(status => {
        console.debug('[call:presence] channel subscribe status', { campaignId, selfId, status })
      })

    channelRef.current = channel
    return () => {
      console.debug('[call:presence] channel torn down', { campaignId, selfId })
      void supabase.removeChannel(channel)
    }
  }, [campaignId, selfId])

  // Um evento de Presence (ex.: o mestre saindo) pode ser perdido enquanto a
  // aba mobile está suspensa (background/tela bloqueada) — ao voltar ao
  // primeiro plano ou recuperar rede, reaplica o mesmo diff do handler de
  // 'sync' acima contra o presenceState() atual, sem depender de um novo
  // evento de servidor para descobrir que alguém já não está mais presente.
  useEffect(() => {
    function resync(source: string) {
      const channel = channelRef.current
      if (!channel) return
      const { currentKeys, updatedKeys, staleKeys } = diffPresenceState(channel, selfId, knownPayloadsRef.current, handlersRef.current)
      console.debug('[call:presence] visibility/online resync triggered', {
        source,
        totalKeys: currentKeys.size,
        allKeys: [...currentKeys],
        updatedKeys,
        staleKeys,
      })
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') resync('visibilitychange')
    }
    function handleOnline() {
      resync('online')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [selfId])

  const dispatch = useCallback((event: CampaignCallEvent) => {
    const channel = channelRef.current
    if (!channel) return
    if (event.type === 'PARTICIPANT_JOIN') {
      void channel.track({
        userId: event.userId,
        characterId: event.characterId,
        cloudflareSessionId: event.cloudflareSessionId,
        accountName: event.accountName,
        cameraEnabled: event.cameraEnabled,
        layoutMode: event.layoutMode,
      })
    } else if (event.type === 'PARTICIPANT_LEAVE') {
      console.debug('[call:presence] dispatch PARTICIPANT_LEAVE → untrack() called', { userId: event.userId })
      void channel.untrack().then(status => {
        console.debug('[call:presence] untrack() resolved', { userId: event.userId, status })
      })
    } else if (event.type === 'FORCE_MUTE') {
      void channel.send({ type: 'broadcast', event: 'force_mute', payload: { targetUserId: event.targetUserId } })
    } else {
      void channel.send({ type: 'broadcast', event: 'force_kick', payload: { targetUserId: event.targetUserId } })
    }
  }, [])

  return dispatch
}
