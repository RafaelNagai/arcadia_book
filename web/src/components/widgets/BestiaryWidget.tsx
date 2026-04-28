import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Creature } from '@/data/creatureTypes'
import creaturesData from '@creatures'
import { CreatureDetails } from '@/components/creature/CreatureDetails'
import {
  CREATURE_ACCENT,
  CREATURE_ACCENT_DIM,
  CREATURE_ACCENT_GLOW,
  CREATURE_CARD_BG,
} from '@/components/creature/constants'

const CREATURES = creaturesData as Creature[]

function CreatureCard({ creature }: { creature: Creature }) {
  return (
    <div
      className="rounded-sm overflow-hidden w-full"
      style={{
        background: CREATURE_CARD_BG,
        border: `1px solid ${CREATURE_ACCENT_DIM}`,
        boxShadow: `0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(160,48,32,0.15)`,
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-start justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, rgba(160,48,32,0.25) 0%, rgba(160,48,32,0.08) 100%)`,
          borderBottom: `1px solid ${CREATURE_ACCENT_DIM}`,
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
            style={{ color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}
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
          <p className="font-display text-lg font-bold" style={{ color: '#F0D0C0' }}>
            {creature.levelRange}
          </p>
        </div>
      </div>

      {/* Image */}
      {creature.image && (
        <div style={{ height: 260, overflow: 'hidden' }}>
          <img
            src={creature.image}
            alt={creature.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-5">
        <CreatureDetails creature={creature} />
      </div>
    </div>
  )
}

export function BestiaryWidget() {
  const [selected, setSelected] = useState(0)

  return (
    <div>
      {/* Creature tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-sm overflow-x-auto"
        style={{ background: 'rgba(160,48,32,0.08)', border: `1px solid ${CREATURE_ACCENT_DIM}` }}
      >
        {CREATURES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setSelected(i)}
            className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-150 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-ui)',
              background: selected === i ? CREATURE_ACCENT : 'transparent',
              color: selected === i ? '#F0D0C0' : 'var(--color-text-muted)',
              border: selected === i ? `1px solid ${CREATURE_ACCENT_GLOW}` : '1px solid transparent',
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
