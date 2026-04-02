import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Creature } from '@/data/creatureTypes'
import creaturesData from '@creatures'

const CREATURES = creaturesData as Creature[]

/* ─── Sub-components ─────────────────────────────────────────────── */

const ACCENT = '#A03020'
const ACCENT_DIM = 'rgba(160,48,32,0.35)'
const ACCENT_GLOW = '#C04030'
const CARD_BG = 'rgba(20,8,6,0.95)'
const SECTION_BG = 'rgba(160,48,32,0.06)'

function attr(value: number) {
  const s = value >= 0 ? `+${value}` : `${value}`
  return (
    <span style={{ color: value > 0 ? ACCENT_GLOW : value < 0 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}>
      {s}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.22em] mb-2"
      style={{ color: ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
    >
      {children}
    </p>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs rounded-sm mr-1 mb-1"
      style={{
        background: ACCENT_DIM,
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-ui)',
        border: `1px solid ${ACCENT_DIM}`,
      }}
    >
      {children}
    </span>
  )
}

function DangerTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs rounded-sm mr-1 mb-1"
      style={{
        background: 'rgba(160,48,32,0.2)',
        color: ACCENT_GLOW,
        fontFamily: 'var(--font-ui)',
        border: `1px solid rgba(160,48,32,0.4)`,
      }}
    >
      {children}
    </span>
  )
}

function CreatureCard({ creature }: { creature: Creature }) {
  return (
    <div
      className="rounded-sm overflow-hidden w-full"
      style={{
        background: CARD_BG,
        border: `1px solid ${ACCENT_DIM}`,
        boxShadow: `0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(160,48,32,0.15)`,
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-start justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, rgba(160,48,32,0.25) 0%, rgba(160,48,32,0.08) 100%)`,
          borderBottom: `1px solid ${ACCENT_DIM}`,
        }}
      >
        <div>
          <h3
            className="font-display text-2xl font-bold tracking-wide mb-0.5"
            style={{ color: '#F0D0C0', letterSpacing: '0.04em' }}
          >
            {creature.name}
          </h3>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
          >
            {creature.style}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
          >
            Nível
          </p>
          <p
            className="font-display text-lg font-bold"
            style={{ color: '#F0D0C0' }}
          >
            {creature.levelRange}
          </p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">

        {/* Lore */}
        <p
          className="font-body text-sm leading-relaxed italic"
          style={{ color: 'var(--color-text-secondary)', borderLeft: `2px solid ${ACCENT_DIM}`, paddingLeft: '0.75rem' }}
        >
          {creature.lore}
        </p>

        {/* Stats strip */}
        <div
          className="grid grid-cols-4 rounded-sm overflow-hidden"
          style={{ border: `1px solid ${ACCENT_DIM}` }}
        >
          {[
            { label: 'Dados Base', value: creature.diceBase },
            { label: 'HP', value: creature.hp },
            { label: 'DA', value: creature.da },
            { label: 'DP', value: creature.dp },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center py-3 px-2"
              style={{
                background: i % 2 === 0 ? SECTION_BG : 'transparent',
                borderRight: i < 3 ? `1px solid ${ACCENT_DIM}` : 'none',
              }}
            >
              <span
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                {s.label}
              </span>
              <span
                className="font-display font-bold text-lg"
                style={{ color: '#F0D0C0' }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Attributes */}
        <div style={{ background: SECTION_BG, borderRadius: 2, padding: '0.75rem 1rem', border: `1px solid ${ACCENT_DIM}` }}>
          <SectionLabel>Atributos</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Físico', val: creature.attributes.fisico },
              { label: 'Destreza', val: creature.attributes.destreza },
              { label: 'Intelecto', val: creature.attributes.intelecto },
              { label: 'Influência', val: creature.attributes.influencia },
            ].map(a => (
              <div key={a.label} className="flex flex-col items-center">
                <span
                  className="text-xs uppercase tracking-wider mb-0.5"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  {a.label}
                </span>
                <span className="font-display font-bold text-xl">{attr(a.val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Immune / Vulnerable */}
        {(creature.immune.length > 0 || creature.vulnerable.length > 0) && (
          <div className="space-y-2">
            {creature.immune.length > 0 && (
              <div>
                <span
                  className="text-xs uppercase tracking-wider mr-2"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  Imune:
                </span>
                {creature.immune.map(i => <Tag key={i}>{i}</Tag>)}
              </div>
            )}
            {creature.vulnerable.length > 0 && (
              <div>
                <span
                  className="text-xs uppercase tracking-wider mr-2"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  Vulnerável:
                </span>
                {creature.vulnerable.map(v => <DangerTag key={v}>{v}</DangerTag>)}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: ACCENT_DIM }} />

        {/* Interactions */}
        {creature.interactions.length > 0 && (
          <div>
            <SectionLabel>Interações</SectionLabel>
            <ul className="space-y-2">
              {creature.interactions.map(i => (
                <li key={i.name} className="flex gap-2 text-sm">
                  <span
                    className="flex-shrink-0 font-semibold"
                    style={{ color: '#F0D0C0', fontFamily: 'var(--font-ui)', minWidth: 0 }}
                  >
                    {i.name}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{i.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {creature.actions.length > 0 && (
          <div>
            <SectionLabel>Ações</SectionLabel>
            <div className="space-y-2">
              {creature.actions.map(a => (
                <div
                  key={a.name}
                  className="rounded-sm p-3"
                  style={{ background: SECTION_BG, border: `1px solid ${ACCENT_DIM}` }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: '#F0D0C0', fontFamily: 'var(--font-ui)' }}
                    >
                      {a.name}
                    </span>
                    {a.once && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-sm flex-shrink-0"
                        style={{
                          background: 'rgba(160,48,32,0.2)',
                          color: ACCENT_GLOW,
                          fontFamily: 'var(--font-ui)',
                          border: `1px solid rgba(160,48,32,0.3)`,
                        }}
                      >
                        {a.once}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        {creature.reactions.length > 0 && (
          <div>
            <SectionLabel>Reações</SectionLabel>
            <div className="space-y-2">
              {creature.reactions.map(r => (
                <div
                  key={r.name}
                  className="rounded-sm p-3"
                  style={{
                    background: 'rgba(160,48,32,0.04)',
                    border: `1px solid rgba(160,48,32,0.2)`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: '#E8C8B8', fontFamily: 'var(--font-ui)' }}
                    >
                      {r.name}
                    </span>
                    {r.once && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-sm flex-shrink-0"
                        style={{
                          background: 'rgba(160,48,32,0.15)',
                          color: ACCENT_GLOW,
                          fontFamily: 'var(--font-ui)',
                          border: `1px solid rgba(160,48,32,0.25)`,
                        }}
                      >
                        {r.once}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        {creature.variants && creature.variants.length > 0 && (
          <div>
            <div style={{ height: 1, background: ACCENT_DIM, marginBottom: '1rem' }} />
            <SectionLabel>Variantes</SectionLabel>
            {creature.variants.map(v => (
              <div
                key={v.name}
                className="rounded-sm p-3 flex items-center gap-4 flex-wrap"
                style={{ background: SECTION_BG, border: `1px solid ${ACCENT_DIM}` }}
              >
                <span
                  className="font-semibold text-sm flex-shrink-0"
                  style={{ color: '#F0D0C0', fontFamily: 'var(--font-ui)' }}
                >
                  {v.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {v.diceBase} · HP {v.hp} · DA {v.da}
                </span>
                <span className="text-xs italic" style={{ color: 'var(--color-text-secondary)' }}>
                  {v.note}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── Main export ────────────────────────────────────────────────── */

export function BestiaryWidget() {
  const [selected, setSelected] = useState(0)

  return (
    <div>
      {/* Creature tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-sm overflow-x-auto"
        style={{ background: 'rgba(160,48,32,0.08)', border: `1px solid ${ACCENT_DIM}` }}
      >
        {CREATURES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setSelected(i)}
            className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-150 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-ui)',
              background: selected === i ? ACCENT : 'transparent',
              color: selected === i ? '#F0D0C0' : 'var(--color-text-muted)',
              border: selected === i ? `1px solid ${ACCENT_GLOW}` : '1px solid transparent',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <CreatureCard creature={CREATURES[selected]} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
