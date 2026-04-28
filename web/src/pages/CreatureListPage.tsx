import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Creature } from '@/data/creatureTypes'
import creaturesData from '@creatures'
import {
  CREATURE_ACCENT,
  CREATURE_ACCENT_DIM,
  CREATURE_ACCENT_GLOW,
  CREATURE_SECTION_BG,
  creatureSlug,
  parseLevelRange,
  getCreatureStyles,
} from '@/components/creature/constants'

const CREATURES = creaturesData as Creature[]

/* ─── Summary card shown in the list grid ────────────────────────── */

function CreatureSummaryCard({ creature, index }: { creature: Creature; index: number }) {
  const navigate = useNavigate()
  const slug = creatureSlug(creature.name)
  const styles = getCreatureStyles(creature.style)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
    >
      <div
        className="rounded-sm overflow-hidden cursor-pointer group relative"
        style={{
          background: 'rgba(10,6,4,0.98)',
          border: `1px solid ${CREATURE_ACCENT_DIM}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onClick={() => navigate(`/criatura/${slug}`)}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = CREATURE_ACCENT
          el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(160,48,32,0.22)`
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = CREATURE_ACCENT_DIM
          el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)'
        }}
      >
        {/* Portrait */}
        <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
          {creature.image ? (
            <img
              src={creature.image}
              alt={creature.name}
              className="transition-transform duration-500 group-hover:scale-105"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, rgba(80,20,10,0.55) 0%, rgba(12,4,2,0.98) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.04,
                  backgroundImage: `repeating-linear-gradient(0deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 40px),
                                    repeating-linear-gradient(90deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 40px)`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '7rem',
                  color: CREATURE_ACCENT,
                  opacity: 0.12,
                  userSelect: 'none',
                  lineHeight: 1,
                }}
              >
                {creature.name[0]}
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '65%',
              background: 'linear-gradient(to top, rgba(10,6,4,0.98) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Level badge */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(10,6,4,0.82)',
              border: `1px solid ${CREATURE_ACCENT_DIM}`,
              borderRadius: 4,
              padding: '0.2rem 0.55rem',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Nível {creature.levelRange}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-4 -mt-8 relative">
          {/* Style tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {styles.map(s => (
              <span
                key={s}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: CREATURE_ACCENT_GLOW,
                  background: 'rgba(160,48,32,0.12)',
                  border: `1px solid rgba(160,48,32,0.3)`,
                  borderRadius: 3,
                  padding: '0.12rem 0.4rem',
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.35rem',
              color: '#F0D0C0',
              letterSpacing: '0.03em',
              marginBottom: '0.75rem',
            }}
          >
            {creature.name}
          </h3>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {[
              { label: 'HP', value: creature.hp },
              { label: 'DA', value: creature.da },
              { label: 'DP', value: creature.dp },
              { label: 'Dados', value: creature.diceBase },
            ].map(s => (
              <div
                key={s.label}
                className="flex flex-col items-center"
                style={{
                  background: CREATURE_SECTION_BG,
                  borderRadius: 3,
                  padding: '0.3rem 0.2rem',
                  border: `1px solid ${CREATURE_ACCENT_DIM}`,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#F0D0C0',
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.52rem',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: 3,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Immune / Vulnerable tags (abbreviated) */}
          {(creature.immune.length > 0 || creature.vulnerable.length > 0) && (
            <div className="space-y-1 mb-3">
              {creature.immune.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.58rem',
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Imune:
                  </span>
                  {creature.immune.slice(0, 3).map(item => (
                    <span
                      key={item}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.58rem',
                        color: 'var(--color-text-secondary)',
                        background: CREATURE_ACCENT_DIM,
                        border: `1px solid ${CREATURE_ACCENT_DIM}`,
                        borderRadius: 3,
                        padding: '0.1rem 0.35rem',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                  {creature.immune.length > 3 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.58rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      +{creature.immune.length - 3}
                    </span>
                  )}
                </div>
              )}
              {creature.vulnerable.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.58rem',
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Vuln:
                  </span>
                  {creature.vulnerable.slice(0, 3).map(item => (
                    <span
                      key={item}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.58rem',
                        color: CREATURE_ACCENT_GLOW,
                        background: 'rgba(160,48,32,0.12)',
                        border: `1px solid rgba(160,48,32,0.3)`,
                        borderRadius: 3,
                        padding: '0.1rem 0.35rem',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                  {creature.vulnerable.length > 3 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.58rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      +{creature.vulnerable.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity duration-200 opacity-40 group-hover:opacity-100"
            style={{ color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
          >
            Ver ficha completa →
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Filter UI primitives ───────────────────────────────────────── */

function FilterGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.6rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        marginBottom: '0.5rem',
      }}
    >
      {children}
    </p>
  )
}

function FilterChip({
  label,
  active,
  danger,
  onClick,
}: {
  label: string
  active: boolean
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.25rem 0.65rem',
        borderRadius: 3,
        fontFamily: 'var(--font-ui)',
        fontSize: '0.68rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: active
          ? danger
            ? 'rgba(160,48,32,0.2)'
            : CREATURE_ACCENT_DIM
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? CREATURE_ACCENT : 'rgba(255,255,255,0.1)'}`,
        color: active
          ? danger
            ? CREATURE_ACCENT_GLOW
            : 'var(--color-text-secondary)'
          : 'var(--color-text-muted)',
      }}
    >
      {label}
    </button>
  )
}

/* ─── Main page ───────────────────────────────────────────────────── */

export function CreatureListPage() {
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set())
  const [minLevel, setMinLevel] = useState('')
  const [maxLevel, setMaxLevel] = useState('')
  const [activeImmune, setActiveImmune] = useState<Set<string>>(new Set())
  const [activeVulnerable, setActiveVulnerable] = useState<Set<string>>(new Set())

  useEffect(() => {
    document.title = 'Bestiário — Arcádia'
    window.scrollTo({ top: 0 })
  }, [])

  const allStyles = useMemo(() => {
    const s = new Set<string>()
    CREATURES.forEach(c => getCreatureStyles(c.style).forEach(t => s.add(t)))
    return Array.from(s).sort()
  }, [])

  const allImmune = useMemo(() => {
    const s = new Set<string>()
    CREATURES.forEach(c => c.immune.forEach(i => s.add(i)))
    return Array.from(s).sort()
  }, [])

  const allVulnerable = useMemo(() => {
    const s = new Set<string>()
    CREATURES.forEach(c => c.vulnerable.forEach(v => s.add(v)))
    return Array.from(s).sort()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const minLvl = minLevel !== '' ? parseInt(minLevel) : null
    const maxLvl = maxLevel !== '' ? parseInt(maxLevel) : null

    return CREATURES.filter(c => {
      if (q && !c.name.toLowerCase().includes(q) && !c.lore.toLowerCase().includes(q)) return false

      if (activeStyles.size > 0) {
        const cStyles = new Set(getCreatureStyles(c.style))
        if (![...activeStyles].some(s => cStyles.has(s))) return false
      }

      if (minLvl !== null || maxLvl !== null) {
        const [cMin, cMax] = parseLevelRange(c.levelRange)
        if (minLvl !== null && cMax < minLvl) return false
        if (maxLvl !== null && cMin > maxLvl) return false
      }

      if (activeImmune.size > 0 && ![...activeImmune].some(i => c.immune.includes(i))) return false
      if (activeVulnerable.size > 0 && ![...activeVulnerable].some(v => c.vulnerable.includes(v))) return false

      return true
    })
  }, [search, activeStyles, minLevel, maxLevel, activeImmune, activeVulnerable])

  const advancedFilterCount =
    activeStyles.size +
    (minLevel ? 1 : 0) +
    (maxLevel ? 1 : 0) +
    activeImmune.size +
    activeVulnerable.size

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    return next
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 4,
    padding: '0.45rem 0.75rem',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.82rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: 'var(--color-abyss)' }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(40,10,6,0.9) 0%, var(--color-abyss) 100%)',
          borderBottom: `1px solid rgba(160,48,32,0.18)`,
          padding: '4rem 2rem 3rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.022,
            backgroundImage: `repeating-linear-gradient(0deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 60px),
                              repeating-linear-gradient(90deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 60px)`,
            pointerEvents: 'none',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <Link
            to="/"
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem',
              transition: 'opacity 0.15s',
            }}
          >
            ← Início
          </Link>
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: 'rgba(160,48,32,0.65)', fontFamily: 'var(--font-ui)' }}
          >
            Criaturas de Arcádia
          </p>
          <h1
            className="font-display font-bold text-4xl mb-3"
            style={{ color: '#F0D0C0', letterSpacing: '-0.01em' }}
          >
            Bestiário
          </h1>
          <p
            className="font-body text-base"
            style={{ color: 'var(--color-text-secondary)', maxWidth: 520 }}
          >
            Fichas completas das criaturas que habitam o Mar de Nuvens e as ilhas flutuantes de Arcádia.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Filter panel ──────────────────────────────────────── */}
        <div
          style={{
            background: 'rgba(10,6,4,0.95)',
            border: `1px solid ${CREATURE_ACCENT_DIM}`,
            borderRadius: 6,
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Search + advanced toggle row */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...inputStyle,
                flex: 1,
                boxSizing: 'border-box',
                borderColor: search ? CREATURE_ACCENT : 'rgba(255,255,255,0.1)',
              }}
            />
            <button
              onClick={() => setFiltersOpen(v => !v)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                borderRadius: 4,
                background: filtersOpen || advancedFilterCount > 0
                  ? 'rgba(160,48,32,0.15)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filtersOpen || advancedFilterCount > 0 ? CREATURE_ACCENT : 'rgba(255,255,255,0.1)'}`,
                color: filtersOpen || advancedFilterCount > 0
                  ? CREATURE_ACCENT_GLOW
                  : 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              Filtros
              {advancedFilterCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: CREATURE_ACCENT,
                    color: '#F0D0C0',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {advancedFilterCount}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.6rem',
                  transition: 'transform 0.2s',
                  transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}
              >
                ▾
              </span>
            </button>
          </div>

          {/* Expandable advanced filters */}
          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    borderTop: `1px solid ${CREATURE_ACCENT_DIM}`,
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Style */}
                  {allStyles.length > 0 && (
                    <div>
                      <FilterGroupLabel>Estilo</FilterGroupLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {allStyles.map(s => (
                          <FilterChip
                            key={s}
                            label={s}
                            active={activeStyles.has(s)}
                            onClick={() => setActiveStyles(toggle(activeStyles, s))}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Level range */}
                  <div>
                    <FilterGroupLabel>Nível</FilterGroupLabel>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          De
                        </span>
                        <input
                          type="number"
                          placeholder="—"
                          value={minLevel}
                          onChange={e => setMinLevel(e.target.value)}
                          min={1}
                          style={{
                            ...inputStyle,
                            width: 72,
                            borderColor: minLevel ? CREATURE_ACCENT : 'rgba(255,255,255,0.1)',
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          Até
                        </span>
                        <input
                          type="number"
                          placeholder="—"
                          value={maxLevel}
                          onChange={e => setMaxLevel(e.target.value)}
                          min={1}
                          style={{
                            ...inputStyle,
                            width: 72,
                            borderColor: maxLevel ? CREATURE_ACCENT : 'rgba(255,255,255,0.1)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Immune */}
                  {allImmune.length > 0 && (
                    <div>
                      <FilterGroupLabel>Imune a</FilterGroupLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {allImmune.map(i => (
                          <FilterChip
                            key={i}
                            label={i}
                            active={activeImmune.has(i)}
                            onClick={() => setActiveImmune(toggle(activeImmune, i))}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vulnerable */}
                  {allVulnerable.length > 0 && (
                    <div>
                      <FilterGroupLabel>Vulnerável a</FilterGroupLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {allVulnerable.map(v => (
                          <FilterChip
                            key={v}
                            label={v}
                            active={activeVulnerable.has(v)}
                            danger
                            onClick={() => setActiveVulnerable(toggle(activeVulnerable, v))}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear advanced */}
                  {advancedFilterCount > 0 && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setActiveStyles(new Set())
                          setMinLevel('')
                          setMaxLevel('')
                          setActiveImmune(new Set())
                          setActiveVulnerable(new Set())
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '0.2rem 0',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e =>
                          ((e.currentTarget as HTMLButtonElement).style.color = CREATURE_ACCENT_GLOW)
                        }
                        onMouseLeave={e =>
                          ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)')
                        }
                      >
                        ✕ Limpar filtros avançados
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results count */}
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}
        >
          {filtered.length} {filtered.length === 1 ? 'criatura encontrada' : 'criaturas encontradas'}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '3.5rem',
              textAlign: 'center',
              border: `1px dashed ${CREATURE_ACCENT_DIM}`,
              borderRadius: 4,
            }}
          >
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.85rem',
              }}
            >
              Nenhuma criatura corresponde aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((creature, i) => (
              <CreatureSummaryCard key={creature.name} creature={creature} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
