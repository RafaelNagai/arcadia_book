import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'
import type { DiceLogEntry } from '@/lib/diceLog'

export interface CharacterStatePayload {
  pe_checks?: Record<string, boolean[]>
  skill_modifiers?: Record<string, number>
  defense_modifiers?: { daBase: number; daBonus: number; dpBonus: number }
  dice_log?: DiceLogEntry[]
}

interface RealtimeHandlers {
  onCharacterUpdate: (data: Record<string, unknown>) => void
  onStateUpdate: (data: CharacterStatePayload) => void
  onInventoryChange: () => void
}

export function useCharacterRealtime(
  characterId: string | undefined,
  handlers: RealtimeHandlers,
): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!characterId) return

    const channel = supabase
      .channel(`character:${characterId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'characters',
        filter: `id=eq.${characterId}`,
      }, payload => {
        handlersRef.current.onCharacterUpdate(payload.new as Record<string, unknown>)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'character_state',
        filter: `character_id=eq.${characterId}`,
      }, payload => {
        handlersRef.current.onStateUpdate(payload.new as CharacterStatePayload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory_items',
        filter: `character_id=eq.${characterId}`,
      }, () => {
        handlersRef.current.onInventoryChange()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory_bags',
        filter: `character_id=eq.${characterId}`,
      }, () => {
        handlersRef.current.onInventoryChange()
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [characterId])
}
