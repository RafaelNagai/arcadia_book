/**
 * LocalStorage persistence for user-created characters.
 *
 * TODO (future): replace with API calls to a backend / auth service.
 * The `owned` flag on Character will map to server-side ownership once auth exists.
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

/** Returns true if this character was created by the user (stored in localStorage). */
export function isOwnedCharacter(id: string): boolean {
  return !!getCustomCharacter(id)
}

/** Persist only the current HP/Sanidade without touching the rest of the sheet. */
export function saveCurrentValues(id: string, currentHp: number, currentSanidade: number): void {
  const all = loadCustomCharacters()
  const idx = all.findIndex(c => c.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], currentHp, currentSanidade }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/* ─── Derived stats ────────────────────────────────────────────── */

const HP_BONUS:    number[] = [0, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8]
const SANID_BONUS: number[] = [0, 4, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1]

export function calcHP(fisico: number): number {
  let hp = 12
  for (let i = 1; i <= fisico; i++) hp += HP_BONUS[Math.min(i, HP_BONUS.length - 1)]
  return hp
}

export function calcSanidade(intelecto: number, influencia: number): number {
  const val = Math.max(intelecto, influencia)
  let san = 15
  for (let i = 1; i <= val; i++) san += SANID_BONUS[Math.min(i, SANID_BONUS.length - 1)]
  return san
}
