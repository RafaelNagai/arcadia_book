/**
 * LocalStorage persistence for user-created characters.
 *
 * TODO (future): replace with API calls to a backend / auth service.
 * The functions below are designed to be swapped out for async API calls
 * without changing the call sites — just wrap in async/await.
 */

import type { Character } from '@/data/characterTypes'

const STORAGE_KEY = 'arcadia_custom_characters'

export function loadCustomCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Character[]) : []
  } catch {
    return []
  }
}

export function saveCustomCharacter(character: Character): void {
  const all = loadCustomCharacters()
  const idx = all.findIndex(c => c.id === character.id)
  if (idx >= 0) {
    all[idx] = character
  } else {
    all.push(character)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteCustomCharacter(id: string): void {
  const all = loadCustomCharacters().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getCustomCharacter(id: string): Character | undefined {
  return loadCustomCharacters().find(c => c.id === id)
}

export function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/* ─── Derived stats ────────────────────────────────────────────── */

const CUMULATIVE_BONUSES = [0, 5, 5, 6, 6, 7] // index = attribute value

export function calcHP(fisico: number): number {
  let hp = 12
  for (let i = 1; i <= Math.min(fisico, 5); i++) hp += CUMULATIVE_BONUSES[i]
  return hp
}

export function calcSanidade(intelecto: number, influencia: number): number {
  const val = Math.max(intelecto, influencia)
  let san = 15
  for (let i = 1; i <= Math.min(val, 5); i++) san += CUMULATIVE_BONUSES[i]
  return san
}
