/**
 * LocalStorage persistence for user-created characters.
 *
 * TODO (future): replace with API calls to a backend / auth service.
 * The `owned` flag on Character will map to server-side ownership once auth exists.
 */

import type { Character, InventoryBag, InventoryItem } from '@/data/characterTypes'

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

const PE_KEY = 'arcadia_pe_checks'
const SKILL_MOD_KEY = 'arcadia_skill_modifiers'

export function loadSkillModifiers(id: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(SKILL_MOD_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {}
    return all[id] ?? {}
  } catch {
    return {}
  }
}

export function saveSkillModifiers(id: string, mods: Record<string, number>): void {
  try {
    const raw = localStorage.getItem(SKILL_MOD_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {}
    all[id] = mods
    localStorage.setItem(SKILL_MOD_KEY, JSON.stringify(all))
  } catch {}
}

export function loadPeChecks(id: string): Record<string, boolean[]> {
  try {
    const raw = localStorage.getItem(PE_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean[]>>) : {}
    return all[id] ?? {}
  } catch {
    return {}
  }
}

export function savePeChecks(id: string, checks: Record<string, boolean[]>): void {
  try {
    const raw = localStorage.getItem(PE_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, Record<string, boolean[]>>) : {}
    all[id] = checks
    localStorage.setItem(PE_KEY, JSON.stringify(all))
  } catch {}
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

/* ─── Inventory ────────────────────────────────────────────────── */

const INVENTORY_KEY = 'arcadia_inventory'

export function loadInventory(characterId: string): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, InventoryItem[]>) : {}
    return all[characterId] ?? []
  } catch {
    return []
  }
}

export function saveInventory(characterId: string, items: InventoryItem[]): void {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, InventoryItem[]>) : {}
    all[characterId] = items
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(all))
  } catch {}
}

/* ─── Bonus slots (bags / containers) ─────────────────────────── */

const BONUS_SLOTS_KEY = 'arcadia_bonus_slots'

export function loadBonusSlots(characterId: string): number {
  try {
    const raw = localStorage.getItem(BONUS_SLOTS_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, number>) : {}
    return all[characterId] ?? 0
  } catch {
    return 0
  }
}

export function saveBonusSlots(characterId: string, bonus: number): void {
  try {
    const raw = localStorage.getItem(BONUS_SLOTS_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, number>) : {}
    all[characterId] = bonus
    localStorage.setItem(BONUS_SLOTS_KEY, JSON.stringify(all))
  } catch {}
}

/* ─── Bags ─────────────────────────────────────────────────────── */

const BAGS_KEY = 'arcadia_bags'

export function loadBags(characterId: string): InventoryBag[] {
  try {
    const raw = localStorage.getItem(BAGS_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, InventoryBag[]>) : {}
    return all[characterId] ?? []
  } catch {
    return []
  }
}

export function saveBags(characterId: string, bags: InventoryBag[]): void {
  try {
    const raw = localStorage.getItem(BAGS_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, InventoryBag[]>) : {}
    all[characterId] = bags
    localStorage.setItem(BAGS_KEY, JSON.stringify(all))
  } catch {}
}

/* ─── Derived stats ────────────────────────────────────────────── */

const HP_BONUS:    number[] = [0, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
const SANID_BONUS: number[] = [0, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

export function calcHP(fisico: number): number {
  let hp = 15
  for (let i = 1; i <= fisico; i++) hp += HP_BONUS[Math.min(i, HP_BONUS.length - 1)]
  return hp
}

export function calcSanidade(intelecto: number, influencia: number): number {
  const val = Math.max(intelecto, influencia)
  let san = 15
  for (let i = 1; i <= val; i++) san += SANID_BONUS[Math.min(i, SANID_BONUS.length - 1)]
  return san
}
