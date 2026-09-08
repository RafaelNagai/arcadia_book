/**
 * Damage string parser for equipment items.
 *
 * Notation:
 *   "4D6"             → roll 4D6, no bonuses
 *   "2D6+2D12"        → roll 2D6 + 2D12, mixed pool
 *   "4D6 + 4"         → roll 4D6, add +4 to the HIGHEST die result
 *   "4D6 + 4 + 2"     → roll 4D6, add +4 to highest, +2 to second-highest
 *   "4D6 + (2)"       → roll 4D6, add +2 to ALL dice
 *   "2D6+2D12+3"      → roll 2D6+2D12, add +3 to the highest die result
 *   "4D6 - 1"         → roll 4D6, subtract 1 from the highest die result
 *
 * Additional die groups are parsed before bonuses: +NdM tokens are consumed
 * as die groups as long as they appear before any standalone numeric bonus.
 *
 * Positional bonuses are applied in rank order: first bonus → highest die,
 * second bonus → second-highest die, and so on across the entire flat pool.
 */

export type BonusType = 'positional' | 'all'

export interface DamageBonus {
  type:  BonusType
  value: number          // positive or negative
}

export interface ParsedDamage {
  dice:    Array<{ dieCount: number; dieType: number }>
  bonuses: DamageBonus[]
}

export function parseDamage(damageStr: string): ParsedDamage | null {
  // Normalise: remove whitespace, uppercase
  const s = damageStr.replace(/\s+/g, '').toUpperCase()

  // Must start with a die group: NdM
  const firstMatch = s.match(/^(\d+)D(\d+)/)
  if (!firstMatch) return null

  const firstCount = parseInt(firstMatch[1], 10)
  const firstType  = parseInt(firstMatch[2], 10)
  if (firstCount < 1 || firstType < 2) return null

  const dice: ParsedDamage['dice'] = [{ dieCount: firstCount, dieType: firstType }]
  const bonuses: DamageBonus[] = []
  let rest = s.slice(firstMatch[0].length)

  while (rest.length > 0) {
    // Another die group: +NdM (must be checked before positional bonus)
    const dieMatch = rest.match(/^\+(\d+)D(\d+)/)
    if (dieMatch) {
      const dc = parseInt(dieMatch[1], 10)
      const dt = parseInt(dieMatch[2], 10)
      if (dc >= 1 && dt >= 2) {
        dice.push({ dieCount: dc, dieType: dt })
        rest = rest.slice(dieMatch[0].length)
        continue
      }
    }

    // "all" bonus: +(N) or -(N)
    const allMatch = rest.match(/^([+-])\((\d+)\)(.*)$/)
    if (allMatch) {
      const sign = allMatch[1] === '-' ? -1 : 1
      bonuses.push({ type: 'all', value: sign * parseInt(allMatch[2], 10) })
      rest = allMatch[3]
      continue
    }

    // positional bonus: +N or -N
    const posMatch = rest.match(/^([+-])(\d+)(.*)$/)
    if (posMatch) {
      const sign = posMatch[1] === '-' ? -1 : 1
      bonuses.push({ type: 'positional', value: sign * parseInt(posMatch[2], 10) })
      rest = posMatch[3]
      continue
    }

    break
  }

  return { dice, bonuses }
}

/**
 * Given settled die values and the parsed bonuses, compute the per-die
 * modifier (sum of all applicable bonuses) for each die index.
 *
 * Returns an array of modifiers parallel to `values`.
 */
export function computeModifiers(values: number[], bonuses: DamageBonus[]): number[] {
  const mods = new Array(values.length).fill(0)
  if (bonuses.length === 0) return mods

  // Rank dice by value descending → sortedIndices[0] = index of highest die
  const sortedIndices = [...values.keys()].sort((a, b) => values[b] - values[a])

  let posRank = 0
  for (const bonus of bonuses) {
    if (bonus.type === 'all') {
      for (let i = 0; i < mods.length; i++) mods[i] += bonus.value
    } else {
      // positional: apply to the (posRank)-th highest die
      const targetIdx = sortedIndices[posRank]
      if (targetIdx !== undefined) {
        mods[targetIdx] += bonus.value
        posRank++
      }
    }
  }

  return mods
}
