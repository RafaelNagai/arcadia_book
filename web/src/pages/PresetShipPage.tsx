import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import shipsData from '@ships'
import type { Ship, NormalizedShip, ShipSector } from '@/data/shipTypes'
import { normalizeShip } from '@/data/shipTypes'
import type { SectorCategoryKey } from '@/data/shipSectorCatalog'
import { getCategoryLabel } from '@/data/shipSectorCatalog'

const PRESET_SHIPS = (shipsData as Ship[]).map(normalizeShip)

const ACCENT = '#50C8E8'
const ACCENT_DIM = 'rgba(80,200,232,0.35)'
const ACCENT_GLOW = 'rgba(80,200,232,0.65)'
const CARD_BG = 'rgba(8,14,26,0.92)'

const CATEGORY_KEY_MAP: Record<ShipSector['category'], SectorCategoryKey> = {
  'Armamento': 'armamentos',
  'Casco': 'casco',
  'Velas': 'velas_motores',
  'Radar': 'radar',
  'Dormitório': 'dormitorio',
  'Cozinha': 'cozinha',
  'Biblioteca': 'biblioteca',
  'Armazém': 'armazem',
}

export function PresetShipPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { scrollY } = useScroll()
  const heroImgY = useTransform(scrollY, [0, 900], [0, -220])
  const heroContentY = useTransform(scrollY, [0, 600], [0, 90])
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0])
  const hintOpacity = useTransform(scrollY, [0, 180], [0.65, 0])

  const ship = useMemo<NormalizedShip | null>(
    () => PRESET_SHIPS.find(s => s.id === slug) ?? null,
    [slug],
  )

  const sectorsByCategory = useMemo(() => {
    if (!ship) return [] as [ShipSector['category'], ShipSector[]][]
    const groups = new Map<ShipSector['category'], ShipSector[]>()
    for (const s of ship.sectors) {
      const list = groups.get(s.category) ?? []
      list.push(s)
      groups.set(s.category, list)
    }
    return Array.from(groups.entries())
  }, [ship])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (ship) document.title = `${ship.name} — Arcádia`
  }, [ship])

  if (!ship) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-abyss)' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            color: '#EEF4FC',
            fontSize: '1.25rem',
          }}
        >
          Navio não encontrado
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: ACCENT_GLOW,
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          ← Voltar aos Navios
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-abyss)' }}>
      {/* ── HERO — full viewport ─────────────────────────────────── */}
      <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          style={{
            y: heroImgY,
            position: 'absolute',
            top: '-20%',
            left: 0,
            right: 0,
            bottom: '-20%',
          }}
        >
          {ship.image ? (
            <img
              src={ship.image}
              alt={ship.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: `radial-gradient(ellipse 55% 55% at 65% 35%, rgba(80,200,232,0.28) 0%, transparent 65%),
                             linear-gradient(155deg, rgba(4,6,12,0.97) 0%, rgba(6,16,26,0.78) 50%, rgba(4,6,12,1) 100%)`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.04,
                  backgroundImage: `repeating-linear-gradient(0deg, ${ACCENT} 0px, ${ACCENT} 1px, transparent 1px, transparent 56px),
                                    repeating-linear-gradient(90deg, ${ACCENT} 0px, ${ACCENT} 1px, transparent 1px, transparent 56px)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '60%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 'min(26rem, 50vw)',
                  color: ACCENT,
                  opacity: 0.06,
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                ⚓
              </div>
            </div>
          )}
        </motion.div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(to top, rgba(4,6,12,0.97) 0%, rgba(4,6,12,0.4) 45%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(to right, rgba(4,6,12,0.52) 0%, transparent 55%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            pointerEvents: 'none',
            background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT}44 50%, transparent 80%)`,
          }}
        />

        <button
          onClick={() => navigate('/navios')}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(4,6,12,0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${ACCENT_DIM}`,
            borderRadius: 4,
            padding: '0.4rem 0.9rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.color = ACCENT_GLOW
            btn.style.borderColor = ACCENT
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.color = 'var(--color-text-muted)'
            btn.style.borderColor = ACCENT_DIM
          }}
        >
          ← Navios
        </button>

        <motion.div
          style={{
            y: heroContentY,
            opacity: heroOpacity,
            position: 'absolute',
            bottom: '9%',
            left: 0,
            right: 0,
            paddingLeft: 'max(2rem, env(safe-area-inset-left))',
            paddingRight: '2rem',
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="text-xs uppercase tracking-[0.22em] font-semibold"
                style={{ color: ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
              >
                {ship.type}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
              <span
                className="text-xs uppercase tracking-[0.18em]"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                {ship.size}
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(3.2rem, 9vw, 7rem)',
                lineHeight: 0.92,
                color: '#EEF4FC',
                letterSpacing: '-0.02em',
                textShadow: '0 0 80px rgba(80,200,232,0.5)',
                marginBottom: '1rem',
              }}
            >
              {ship.name}
            </h1>

            <div className="flex flex-wrap gap-2">
              <StatPill label="HP" value={ship.hp} />
              <StatPill label="DN" value={ship.dn} />
              <StatPill label="Slots" value={`${ship.slots.used}/${ship.slots.total}`} />
              <StatPill label="Capitão" value={ship.captainAttribute} />
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{
            opacity: hintOpacity,
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 10,
          }}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            ficha
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: `linear-gradient(to bottom, ${ACCENT}55, transparent)`,
            }}
          />
        </motion.div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '2.5rem clamp(1.25rem, 5vw, 2rem) 7rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          style={{
            background: CARD_BG,
            border: `1px solid ${ACCENT_DIM}`,
            borderRadius: 6,
            padding: '2rem',
            boxShadow: '0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(80,200,232,0.12)',
          }}
        >
          <section style={{ marginBottom: '2rem' }}>
            <SectionLabel>Lore</SectionLabel>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {ship.lore || '—'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <SectionLabel>Setores</SectionLabel>
            {sectorsByCategory.length === 0 ? (
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Nenhum setor registrado.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sectorsByCategory.map(([category, sectors]) => (
                  <div key={category}>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.35)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {getCategoryLabel(CATEGORY_KEY_MAP[category])}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {sectors.map((s, i) => (
                        <div
                          key={`${s.name}-${i}`}
                          style={{
                            padding: '0.6rem 0.85rem',
                            borderRadius: 4,
                            background: 'rgba(10,15,30,0.9)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <p
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#EEF4FC',
                            }}
                          >
                            {s.name}
                          </p>
                          <p
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.7rem',
                              color: ACCENT,
                              marginTop: '0.15rem',
                            }}
                          >
                            {s.effect} · {s.slots} slot{s.slots !== 1 ? 's' : ''}
                            {s.test && s.test !== '—' ? ` · Teste: ${s.test}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {ship.traits.length > 0 && (
            <section>
              <SectionLabel>Traços</SectionLabel>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.1rem', margin: 0 }}>
                {ship.traits.map((t, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Section label ───────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.62rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginBottom: '0.75rem',
      }}
    >
      {children}
    </p>
  )
}

/* ─── Hero stat pill ──────────────────────────────────────────────── */

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: 'rgba(4,6,12,0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${ACCENT_DIM}`,
        borderRadius: 4,
        padding: '0.32rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.58rem',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1rem',
          color: '#EEF4FC',
        }}
      >
        {value}
      </span>
    </div>
  )
}
