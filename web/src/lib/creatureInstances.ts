import type { CreatureInstance } from './mapTypes'

const key = (mapId: string) => `arcadia_creature_instances_${mapId}`
const PREF_SIZES_KEY = 'arcadia_creature_preferred_sizes'

export function loadCreatureInstances(mapId: string): CreatureInstance[] {
  try {
    return JSON.parse(localStorage.getItem(key(mapId)) ?? '[]')
  } catch { return [] }
}

export function saveCreatureInstances(mapId: string, instances: CreatureInstance[]): void {
  localStorage.setItem(key(mapId), JSON.stringify(instances))
}

export function loadCreaturePreferredSize(slug: string, fallback = 1): number {
  try {
    const map = JSON.parse(localStorage.getItem(PREF_SIZES_KEY) ?? '{}') as Record<string, number>
    return map[slug] ?? fallback
  } catch { return fallback }
}

export function saveCreaturePreferredSize(slug: string, size: number): void {
  try {
    const map = JSON.parse(localStorage.getItem(PREF_SIZES_KEY) ?? '{}') as Record<string, number>
    map[slug] = size
    localStorage.setItem(PREF_SIZES_KEY, JSON.stringify(map))
  } catch {}
}
