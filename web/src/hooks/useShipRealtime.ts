import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/apiClient'

interface ShipRealtimeHandlers {
  onShipUpdate: (data: Record<string, unknown>) => void
  onStateUpdate: (data: Record<string, unknown>) => void
  onCrewChange: () => void
}

export function useShipRealtime(shipId: string | undefined, handlers: ShipRealtimeHandlers): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!shipId) return

    const channel = supabase
      .channel(`ship:${shipId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ships',
        filter: `id=eq.${shipId}`,
      }, payload => {
        handlersRef.current.onShipUpdate(payload.new as Record<string, unknown>)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ship_state',
        filter: `ship_id=eq.${shipId}`,
      }, payload => {
        handlersRef.current.onStateUpdate(payload.new as Record<string, unknown>)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ship_crew',
        filter: `ship_id=eq.${shipId}`,
      }, () => {
        handlersRef.current.onCrewChange()
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [shipId])
}
