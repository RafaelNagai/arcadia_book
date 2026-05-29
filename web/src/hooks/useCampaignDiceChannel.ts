import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'
import type { DiceLogEntry } from '@/lib/diceLog'

export interface DiceRollEvent {
  type: 'DICE_ROLL'
  characterId: string
  characterName: string
  senderId: string
  entry: DiceLogEntry
}

export function useCampaignDiceChannel(
  campaignId: string | null | undefined,
  onRoll: (event: DiceRollEvent) => void,
): (event: DiceRollEvent) => void {
  const onRollRef = useRef(onRoll)
  onRollRef.current = onRoll

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!campaignId) return

    console.log('[DiceChannel] subscribing to campaign:', campaignId)

    const channel = supabase
      .channel(`campaign:${campaignId}:dice`)
      .on('broadcast', { event: 'DICE_ROLL' }, ({ payload }) => {
        console.log('[DiceChannel] received DICE_ROLL:', payload)
        onRollRef.current(payload as DiceRollEvent)
      })
      .subscribe((status) => {
        console.log('[DiceChannel] status:', status)
      })

    channelRef.current = channel
    return () => {
      console.log('[DiceChannel] unsubscribing from campaign:', campaignId)
      void supabase.removeChannel(channel)
    }
  }, [campaignId])

  const broadcast = useCallback((event: DiceRollEvent) => {
    console.log('[DiceChannel] broadcasting:', event.entry.type, 'character:', event.characterId, 'channel ready:', !!channelRef.current)
    void channelRef.current?.send({ type: 'broadcast', event: 'DICE_ROLL', payload: event })
  }, [])

  return broadcast
}
