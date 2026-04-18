import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { MutableRefObject, ReactNode } from 'react'
import { createElement } from 'react'

/* ────────────────────────────────────────────────────────────────
   Entry types
   ──────────────────────────────────────────────────────────────── */

export type DiceLogType = 'skill' | 'arcano' | 'damage' | 'free'
export type SpecialState = 'milagre' | 'critico' | 'desastre' | 'falha_critica' | null

interface BaseEntry {
  id: string
  timestamp: number
  type: DiceLogType
}

export interface SkillLogEntry extends BaseEntry {
  type: 'skill'
  skillLabel: string
  skillValue: number
  modifier: number
  attrLabel: string
  attrValue: number
  results: number[]
  chosenIndices: number[]
  diceSum: number
  finalResult: number
  specialState: SpecialState
}

export interface ArcanoLogEntry extends BaseEntry {
  type: 'arcano'
  selectedElement: string
  afinidade: string
  antitese: string
  elementBonus: number
  runaBonus: number
  totalBonus: number
  slottedRunasNames: string[]
  results: number[]
  chosenIndices: number[]
  diceSum: number
  finalResult: number
  specialState: SpecialState
}

export interface DamageLogEntry extends BaseEntry {
  type: 'damage'
  damageStr: string
  equipmentName: string
  results: number[]
  flatDieTypes: number[]
  modifiers: number[]
  total: number
}

export interface FreeLogEntry extends BaseEntry {
  type: 'free'
  selections: Record<number, number>
  results: number[]
  total: number
}

export type DiceLogEntry = SkillLogEntry | ArcanoLogEntry | DamageLogEntry | FreeLogEntry

// Distributive Omit — applies Omit to each member of the union separately
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never
export type NewDiceLogEntry = DistributiveOmit<DiceLogEntry, 'id' | 'timestamp'>

/* ────────────────────────────────────────────────────────────────
   Context
   ──────────────────────────────────────────────────────────────── */

interface DiceLogCtx {
  entries: DiceLogEntry[]
  addEntry: (entry: NewDiceLogEntry) => void
  clearLog: () => void
  isLogOpen: boolean
  setLogOpen: (v: boolean) => void
}

const DiceLogContext = createContext<DiceLogCtx | null>(null)

function storageKey(characterId: string) {
  return `arcadia_dice_log_${characterId}`
}

function loadLog(characterId: string): DiceLogEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(characterId))
    return raw ? (JSON.parse(raw) as DiceLogEntry[]) : []
  } catch {
    return []
  }
}

function saveLog(characterId: string, entries: DiceLogEntry[]) {
  try {
    localStorage.setItem(storageKey(characterId), JSON.stringify(entries))
  } catch {
    // quota exceeded — ignore silently
  }
}

export function DiceLogProvider({
  children,
  characterId,
  initialEntries,
  persistEntry,
  persistClear,
  setterRef,
}: {
  children: ReactNode
  characterId?: string
  initialEntries?: DiceLogEntry[]
  persistEntry?: (entry: DiceLogEntry) => void
  persistClear?: () => void
  setterRef?: MutableRefObject<((entries: DiceLogEntry[]) => void) | null>
}) {
  const [entries, setEntries] = useState<DiceLogEntry[]>(() =>
    initialEntries !== undefined ? initialEntries : (characterId ? loadLog(characterId) : []),
  )
  const [isLogOpen, setLogOpen] = useState(false)

  // Expose setter so CharacterPage can inject realtime updates
  useEffect(() => {
    if (!setterRef) return
    setterRef.current = setEntries
    return () => { setterRef.current = null }
  }, [setterRef])

  const addEntry = useCallback((entry: NewDiceLogEntry) => {
    const full = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    } as DiceLogEntry
    setEntries(prev => {
      const next = [full, ...prev]
      if (!persistEntry && characterId) saveLog(characterId, next)
      return next
    })
    if (persistEntry) persistEntry(full)
  }, [characterId, persistEntry])

  const clearLog = useCallback(() => {
    setEntries([])
    if (persistClear) {
      persistClear()
    } else if (characterId) {
      saveLog(characterId, [])
    }
  }, [characterId, persistClear])

  return createElement(
    DiceLogContext.Provider,
    { value: { entries, addEntry, clearLog, isLogOpen, setLogOpen } },
    children,
  )
}

export function useDiceLog(): DiceLogCtx {
  const ctx = useContext(DiceLogContext)
  if (!ctx) throw new Error('useDiceLog must be used inside DiceLogProvider')
  return ctx
}
