export const CREATURE_ACCENT = '#A03020'
export const CREATURE_ACCENT_DIM = 'rgba(160,48,32,0.35)'
export const CREATURE_ACCENT_GLOW = '#C04030'
export const CREATURE_SECTION_BG = 'rgba(160,48,32,0.06)'
export const CREATURE_CARD_BG = 'rgba(20,8,6,0.95)'

export function creatureSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseLevelRange(range: string): [number, number] {
  const cleaned = range.replace(/\s+/g, '')
  const match = cleaned.match(/(\d+)[–\-](\d+)/)
  if (match) return [parseInt(match[1]), parseInt(match[2])]
  const single = parseInt(cleaned)
  return isNaN(single) ? [0, 0] : [single, single]
}

export function getCreatureStyles(style: string): string[] {
  return style.split('·').map(s => s.trim()).filter(Boolean)
}
