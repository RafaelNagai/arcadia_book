import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { Creature } from '@/data/creatureTypes'
import creaturesData from '@creatures'
import { HoneycombGrid } from '@/components/character/HoneycombGrid'
import { CreatureDetails } from '@/components/creature/CreatureDetails'
import {
  CREATURE_ACCENT,
  CREATURE_ACCENT_DIM,
  CREATURE_ACCENT_GLOW,
  CREATURE_CARD_BG,
  creatureSlug,
  getCreatureStyles,
} from '@/components/creature/constants'

const CREATURES = creaturesData as Creature[]

export function CreaturePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { scrollY } = useScroll()
  const heroImgY     = useTransform(scrollY, [0, 900], [0, -220])
  const heroContentY = useTransform(scrollY, [0, 600], [0, 90])
  const heroOpacity  = useTransform(scrollY, [0, 420], [1, 0])
  const hintOpacity  = useTransform(scrollY, [0, 180], [0.65, 0])

  const creature = useMemo<Creature | null>(
    () => CREATURES.find(c => creatureSlug(c.name) === slug) ?? null,
    [slug],
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (creature) document.title = `${creature.name} — Bestiário Arcádia`
  }, [creature])

  if (!creature) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-void)' }}
      >
        <p style={{ fontFamily: 'var(--font-display)', color: '#F0D0C0', fontSize: '1.25rem' }}>
          Criatura não encontrada
        </p>
        <button
          onClick={() => navigate('/criaturas')}
          style={{
            background: 'none', border: 'none',
            color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)',
            fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.1em',
          }}
        >
          ← Voltar ao Bestiário
        </button>
      </div>
    )
  }

  const styles = getCreatureStyles(creature.style)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-void)' }}>

      {/* ── HERO — full viewport ─────────────────────────────────── */}
      <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Parallax image layer */}
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
          {creature.image ? (
            <img
              src={creature.image}
              alt={creature.name}
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
                background: `radial-gradient(ellipse 55% 55% at 65% 35%, rgba(160,48,32,0.45) 0%, transparent 65%),
                             linear-gradient(155deg, rgba(4,6,12,0.97) 0%, rgba(20,6,4,0.78) 50%, rgba(4,6,12,1) 100%)`,
              }}
            >
              <div
                style={{
                  position: 'absolute', inset: 0, opacity: 0.04,
                  backgroundImage: `repeating-linear-gradient(0deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 56px),
                                    repeating-linear-gradient(90deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 56px)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%', left: '60%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 'min(32rem, 58vw)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: CREATURE_ACCENT,
                  opacity: 0.05,
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {creature.name[0]}
              </div>
            </div>
          )}
        </motion.div>

        {/* Gradient overlays — same structure as CharacterHero */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to top, rgba(4,6,12,0.97) 0%, rgba(4,6,12,0.4) 45%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to right, rgba(4,6,12,0.52) 0%, transparent 55%)',
          }}
        />
        {/* Bottom accent line in creature red */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 2, pointerEvents: 'none',
            background: `linear-gradient(90deg, ${CREATURE_ACCENT} 0%, ${CREATURE_ACCENT}44 50%, transparent 80%)`,
          }}
        />

        {/* Back button — stays visible while scrolling */}
        <button
          onClick={() => navigate('/criaturas')}
          style={{
            position: 'absolute', top: 20, left: 20, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(4,6,12,0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${CREATURE_ACCENT_DIM}`,
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
            btn.style.color = CREATURE_ACCENT_GLOW
            btn.style.borderColor = CREATURE_ACCENT
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.color = 'var(--color-text-muted)'
            btn.style.borderColor = CREATURE_ACCENT_DIM
          }}
        >
          ← Bestiário
        </button>

        {/* Hero content — fades + moves on scroll */}
        <motion.div
          style={{
            y: heroContentY,
            opacity: heroOpacity,
            position: 'absolute',
            bottom: '9%',
            left: 0, right: 0,
            paddingLeft: 'max(2rem, env(safe-area-inset-left))',
            paddingRight: '2rem',
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 720 }}>
            {/* Style · Level */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {styles.map((s, i) => (
                <span key={s} style={{ display: 'contents' }}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>}
                  <span
                    className="text-xs uppercase tracking-[0.22em] font-semibold"
                    style={{ color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
                  >
                    {s}
                  </span>
                </span>
              ))}
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
              <span
                className="text-xs uppercase tracking-[0.18em]"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                Nível {creature.levelRange}
              </span>
            </div>

            {/* Name */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(3.2rem, 9vw, 7rem)',
                lineHeight: 0.92,
                color: '#F0D0C0',
                letterSpacing: '-0.02em',
                textShadow: `0 0 80px rgba(160,48,32,0.6)`,
                marginBottom: '1rem',
              }}
            >
              {creature.name}
            </h1>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              <StatPill label="HP"    value={creature.hp} />
              <StatPill label="DA"    value={creature.da} />
              <StatPill label="DP"    value={creature.dp} />
              <StatPill label="Dados" value={creature.diceBase} />
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{
            opacity: hintOpacity,
            position: 'absolute', bottom: 24, right: 24, zIndex: 10,
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
              width: 1, height: 28,
              background: `linear-gradient(to bottom, ${CREATURE_ACCENT}55, transparent)`,
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
        {/* HP Honeycomb */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: CREATURE_CARD_BG,
            border: `1px solid ${CREATURE_ACCENT_DIM}`,
            borderRadius: 6,
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            boxShadow: `0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(160,48,32,0.12)`,
          }}
        >
          <HoneycombGrid
            total={creature.hp}
            current={creature.hp}
            colorTop="#A03020"
            colorBottom="#601810"
            label="Vida"
            accentColor={CREATURE_ACCENT_GLOW}
          />
        </motion.div>

        {/* Attribute grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          style={{
            background: CREATURE_CARD_BG,
            border: `1px solid ${CREATURE_ACCENT_DIM}`,
            borderRadius: 6,
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            boxShadow: `0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(160,48,32,0.12)`,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
          >
            Atributos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Físico',    val: creature.attributes.fisico },
              { label: 'Destreza',  val: creature.attributes.destreza },
              { label: 'Intelecto', val: creature.attributes.intelecto },
              { label: 'Influência',val: creature.attributes.influencia },
            ].map(a => (
              <div
                key={a.label}
                className="flex flex-col items-center"
                style={{
                  background: 'rgba(160,48,32,0.06)',
                  border: `1px solid ${CREATURE_ACCENT_DIM}`,
                  borderRadius: 4,
                  padding: '1rem 0.5rem',
                }}
              >
                <span
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  {a.label}
                </span>
                <span
                  className="font-display font-bold"
                  style={{
                    fontSize: '2.25rem', lineHeight: 1,
                    color: a.val > 0
                      ? CREATURE_ACCENT_GLOW
                      : a.val < 0
                      ? 'var(--color-text-muted)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {a.val >= 0 ? `+${a.val}` : a.val}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main sheet card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          style={{
            background: CREATURE_CARD_BG,
            border: `1px solid ${CREATURE_ACCENT_DIM}`,
            borderRadius: 6,
            padding: '2rem',
            boxShadow: `0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(160,48,32,0.15)`,
          }}
        >
          <CreatureDetails creature={creature} />
        </motion.div>
      </div>
    </div>
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
        border: `1px solid ${CREATURE_ACCENT_DIM}`,
        borderRadius: 4,
        padding: '0.32rem 0.8rem',
        display: 'flex', alignItems: 'center', gap: '0.45rem',
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
          color: '#F0D0C0',
        }}
      >
        {value}
      </span>
    </div>
  )
}
