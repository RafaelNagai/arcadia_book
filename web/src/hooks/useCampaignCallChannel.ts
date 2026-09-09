import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'

export type CampaignCallEvent =
  | { type: 'PARTICIPANT_JOIN'; userId: string; characterId: string | null; cloudflareSessionId: string }
  | { type: 'PARTICIPANT_LEAVE'; userId: string }

interface CallPresencePayload {
  userId: string
  characterId: string | null
  cloudflareSessionId: string
}

interface CampaignCallHandlers {
  selfId: string | undefined
  onParticipantJoin: (userId: string, characterId: string | null, cloudflareSessionId: string) => void
  onParticipantLeave: (userId: string) => void
}

// Presence (not broadcast) backs this hook: broadcast messages aren't replayed
// to clients that subscribe after they were sent, so a participant who joins
// the call after others would never discover who's already connected.
// Presence sync gives every subscriber the full current roster, which we diff
// against what we've already seen to derive PARTICIPANT_JOIN/LEAVE either way.
export function useCampaignCallChannel(
  campaignId: string,
  handlers: CampaignCallHandlers,
): (event: CampaignCallEvent) => void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const knownKeysRef = useRef<Set<string>>(new Set())
  const selfId = handlers.selfId

  useEffect(() => {
    knownKeysRef.current = new Set()

    const channel = supabase
      .channel(`campaign:${campaignId}:call`, { config: { presence: { key: selfId ?? crypto.randomUUID() } } })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<CallPresencePayload>()
        const currentKeys = new Set(Object.keys(state).filter(key => key !== selfId))

        for (const key of currentKeys) {
          if (knownKeysRef.current.has(key)) continue
          const latest = state[key][state[key].length - 1]
          if (latest) handlersRef.current.onParticipantJoin(latest.userId, latest.characterId, latest.cloudflareSessionId)
        }
        for (const key of knownKeysRef.current) {
          if (!currentKeys.has(key)) handlersRef.current.onParticipantLeave(key)
        }
        knownKeysRef.current = currentKeys
      })
      .subscribe()

    channelRef.current = channel
    return () => { void supabase.removeChannel(channel) }
  }, [campaignId, selfId])

  const dispatch = useCallback((event: CampaignCallEvent) => {
    const channel = channelRef.current
    if (!channel) return
    if (event.type === 'PARTICIPANT_JOIN') {
      void channel.track({ userId: event.userId, characterId: event.characterId, cloudflareSessionId: event.cloudflareSessionId })
    } else {
      void channel.untrack()
    }
  }, [])

  return dispatch
}
