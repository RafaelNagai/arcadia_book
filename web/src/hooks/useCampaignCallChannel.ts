import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'

export type CampaignCallEvent =
  | { type: 'PARTICIPANT_JOIN'; userId: string; characterId: string | null; cloudflareSessionId: string; accountName: string; cameraEnabled: boolean }
  | { type: 'PARTICIPANT_LEAVE'; userId: string }
  | { type: 'FORCE_MUTE'; targetUserId: string }

interface CallPresencePayload {
  userId: string
  characterId: string | null
  cloudflareSessionId: string
  accountName: string
  cameraEnabled: boolean
}

function payloadsEqual(a: CallPresencePayload, b: CallPresencePayload): boolean {
  return a.userId === b.userId
    && a.characterId === b.characterId
    && a.cloudflareSessionId === b.cloudflareSessionId
    && a.accountName === b.accountName
    && a.cameraEnabled === b.cameraEnabled
}

interface CampaignCallHandlers {
  selfId: string | undefined
  onParticipantUpdate: (userId: string, characterId: string | null, cloudflareSessionId: string, accountName: string, cameraEnabled: boolean) => void
  onParticipantLeave: (userId: string) => void
  onForceMute: () => void
}

// Presence (not broadcast) backs this hook: broadcast messages aren't replayed
// to clients that subscribe after they were sent, so a participant who joins
// the call after others would never discover who's already connected.
// Presence sync gives every subscriber the full current roster, which we diff
// against the last payload we've seen per key to derive updates either way —
// both a brand-new key and a re-`track()` of an already-known key (e.g. to
// propagate `cameraEnabled` changing mid-call) must reach `onParticipantUpdate`.
// FORCE_MUTE rides a plain broadcast on this same channel: it's a one-off
// directed action, not state that needs to survive for someone joining later.
export function useCampaignCallChannel(
  campaignId: string,
  handlers: CampaignCallHandlers,
): (event: CampaignCallEvent) => void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const knownPayloadsRef = useRef<Map<string, CallPresencePayload>>(new Map())
  const selfId = handlers.selfId

  useEffect(() => {
    knownPayloadsRef.current = new Map()

    const channel = supabase
      .channel(`campaign:${campaignId}:call`, { config: { presence: { key: selfId ?? crypto.randomUUID() } } })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<CallPresencePayload>()
        const currentKeys = new Set(Object.keys(state).filter(key => key !== selfId))

        for (const key of currentKeys) {
          const latest = state[key][state[key].length - 1]
          if (!latest) continue
          const previous = knownPayloadsRef.current.get(key)
          if (previous && payloadsEqual(previous, latest)) continue
          knownPayloadsRef.current.set(key, latest)
          handlersRef.current.onParticipantUpdate(latest.userId, latest.characterId, latest.cloudflareSessionId, latest.accountName, latest.cameraEnabled)
        }
        const staleKeys = [...knownPayloadsRef.current.keys()].filter(key => !currentKeys.has(key))
        for (const key of staleKeys) {
          knownPayloadsRef.current.delete(key)
          handlersRef.current.onParticipantLeave(key)
        }
      })
      .on('broadcast', { event: 'force_mute' }, ({ payload }) => {
        if (payload?.targetUserId === selfId) handlersRef.current.onForceMute()
      })
      .subscribe()

    channelRef.current = channel
    return () => { void supabase.removeChannel(channel) }
  }, [campaignId, selfId])

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
      })
    } else if (event.type === 'PARTICIPANT_LEAVE') {
      void channel.untrack()
    } else {
      void channel.send({ type: 'broadcast', event: 'force_mute', payload: { targetUserId: event.targetUserId } })
    }
  }, [])

  return dispatch
}
