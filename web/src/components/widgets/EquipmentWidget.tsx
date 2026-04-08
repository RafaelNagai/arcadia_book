import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATALOG, TIER_COLOR, WEIGHT_OPTIONS } from '@/components/inventory/types'
import type { CatalogEntry } from '@/components/inventory/types'
import { ImageZoomOverlay } from '@/components/ImageZoomOverlay'

/* ─── Extended type (da / arcaneBonus not in CatalogEntry) ──────── */

interface EquipmentEntry extends CatalogEntry {
  da?: number
  arcaneBonus?: number
}

const EQUIPMENT = CATALOG as EquipmentEntry[]

/* ─── Helpers ───────────────────────────────────────────────────── */

const WEIGHT_LABEL: Record<string, string> = Object.fromEntries(
  WEIGHT_OPTIONS.map(w => [
    w.value,
    `${w.num === 0 ? 'Nulo' : w.num === 1 ? 'S.Leve' : w.num === 2 ? 'Leve' : w.num === 4 ? 'Médio' : w.num === 8 ? 'Pesado' : w.num === 16 ? 'S.Pesado' : w.num === 32 ? 'Massivo' : 'H.Massivo'} (${w.num})`,
  ])
)

const CATEGORY_SHORT: Record<string, string> = {
  'Arma Corpo-a-Corpo':    'Corpo-a-Corpo',
  'Arma Longa-Distância':  'Longa Distância',
  'Projétil':              'Projétil',
  'Equipamento Defensivo': 'Defensivo',
  'Item Arcano':           'Arcano',
}

const ALL_CATEGORIES = Array.from(new Set(EQUIPMENT.map(e => e.category)))
const ALL_TIERS = Array.from(new Set(EQUIPMENT.map(e => e.tier)))
  .sort((a, b) => Object.keys(TIER_COLOR).indexOf(a) - Object.keys(TIER_COLOR).indexOf(b))

function resolveImage(path: string | null | undefined): string | null {
  if (!path) return null
  return path.startsWith('http') ? path : `/${path}`
}

/* ─── Item Card ─────────────────────────────────────────────────── */

function ItemCard({
  item,
  onZoom,
}: {
  item: EquipmentEntry
  onZoom: (src: string) => void
}) {
  const tierColor = TIER_COLOR[item.tier] ?? '#A09880'
  const imgSrc = resolveImage(item.image)

  // Primary combat stat
  const combatStat = item.damage
    ? { label: 'Dano', value: item.damage }
    : item.da != null
    ? { label: 'DA', value: item.da }
    : item.arcaneBonus != null
    ? { label: 'Bônus Arc.', value: `+${item.arcaneBonus}` }
    : null

  return (
    <div
      className="flex flex-col h-full rounded-sm overflow-hidden"
      style={{
        background: 'rgba(10,15,30,0.9)',
        border: `1px solid rgba(255,255,255,0.07)`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Tier bar */}
      <div style={{ height: 2, background: tierColor, opacity: 0.7, flexShrink: 0 }} />

      {/* Image — square-ish via aspect-ratio */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          background: 'rgba(0,0,0,0.35)',
          cursor: imgSrc ? 'zoom-in' : 'default',
          flexShrink: 0,
        }}
        onClick={() => imgSrc && onZoom(imgSrc)}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
          />
        ) : (
          /* Placeholder */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${tierColor}0A 0%, transparent 70%)`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3.5rem',
                fontWeight: 700,
                color: tierColor,
                opacity: 0.15,
                userSelect: 'none',
              }}
            >
              ?
            </span>
          </div>
        )}

        {/* Weight badge — floating bottom-right of image */}
        <span
          className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-sm text-xs"
          style={{
            background: 'rgba(4,6,12,0.82)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.55rem',
            letterSpacing: '0.08em',
            backdropFilter: 'blur(4px)',
          }}
        >
          {WEIGHT_LABEL[item.weight] ?? item.weight}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2.5">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="text-xs mb-0.5"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {item.subcategory}
            </p>
            <h3
              className="font-display font-bold leading-tight"
              style={{ color: 'var(--color-text-primary)', fontSize: '1rem' }}
            >
              {item.name}
            </h3>
          </div>
          <span
            className="flex-shrink-0 font-bold px-2 py-0.5 rounded-sm"
            style={{
              color: tierColor,
              background: `${tierColor}18`,
              border: `1px solid ${tierColor}44`,
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
            }}
          >
            {item.tier}
          </span>
        </div>

        {/* Stats row: combat stat + durability */}
        {(combatStat || item.maxDurability != null) && (
          <div className="flex gap-2">
            {combatStat && (
              <div
                className="flex flex-col items-center justify-center px-3 py-1.5 flex-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 3,
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {combatStat.label}
                </span>
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {combatStat.value}
                </span>
              </div>
            )}
            {item.maxDurability != null && (
              <div
                className="flex flex-col items-center justify-center px-3 py-1.5 flex-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 3,
                }}
              >
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  Durabilidade
                </span>
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.maxDurability}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Effects */}
        {item.effects.length > 0 ? (
          <ul className="space-y-1.5 flex-1">
            {item.effects.map((eff, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed flex gap-2"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-ui)' }}
              >
                <span style={{ color: tierColor, flexShrink: 0, marginTop: 1 }}>◆</span>
                {eff}
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="text-xs flex-1"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-ui)',
              fontStyle: 'italic',
            }}
          >
            Sem efeitos especiais.
          </p>
        )}

        {/* Description quote */}
        <p
          className="text-xs leading-relaxed italic border-l-2 pl-2.5 mt-auto"
          style={{
            color: 'var(--color-text-muted)',
            borderColor: `${tierColor}40`,
            fontFamily: 'var(--font-body)',
          }}
        >
          "{item.description}"
        </p>
      </div>
    </div>
  )
}

/* ─── Filter chip ───────────────────────────────────────────────── */

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  const c = color ?? 'var(--color-arcano)'
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 text-xs rounded-sm transition-all duration-150 whitespace-nowrap"
      style={{
        fontFamily: 'var(--font-ui)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: active ? `${c}22` : 'transparent',
        color: active ? c : 'var(--color-text-muted)',
        border: active ? `1px solid ${c}55` : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </button>
  )
}

/* ─── Main widget ───────────────────────────────────────────────── */

export function EquipmentWidget() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTier, setActiveTier] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EQUIPMENT.filter(item => {
      if (activeCategory && item.category !== activeCategory) return false
      if (activeTier && item.tier !== activeTier) return false
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.subcategory.toLowerCase().includes(q) ||
          item.effects.some(e => e.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [search, activeCategory, activeTier])

  const hasFilters = !!(activeCategory || activeTier || search)

  return (
    <>
      <div className="space-y-5">

        {/* Search */}
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}
          >
            ⌕
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, efeito ou tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2.5 rounded-sm text-sm outline-none transition-colors duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-ui)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.4)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map(cat => (
            <Chip
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(prev => prev === cat ? null : cat)}
            >
              {CATEGORY_SHORT[cat] ?? cat}
            </Chip>
          ))}
        </div>

        {/* Tier filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span
            className="text-xs mr-1"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-ui)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Tier:
          </span>
          {ALL_TIERS.map(t => (
            <Chip
              key={t}
              active={activeTier === t}
              color={TIER_COLOR[t]}
              onClick={() => setActiveTier(prev => prev === t ? null : t)}
            >
              {t}
            </Chip>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
          {hasFilters && (
            <button
              onClick={() => { setActiveCategory(null); setActiveTier(null); setSearch('') }}
              className="ml-3 underline"
              style={{ color: 'var(--color-arcano-dim)' }}
            >
              limpar filtros
            </button>
          )}
        </p>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="h-full"
                >
                  <ItemCard item={item} onZoom={setZoomedImage} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-sm"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
            >
              Nenhum item encontrado.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom overlay — outside the scroll container */}
      <ImageZoomOverlay src={zoomedImage} onClose={() => setZoomedImage(null)} />
    </>
  )
}
