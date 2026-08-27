import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ACCENT = '#50C8E8'
const ACCENT_GLOW = 'rgba(80,200,232,0.35)'

export interface ShipSummaryCardData {
  id: string
  name: string
  subtitle: string
  imageUrl: string | null
  type: string
  hp: number
  currentHp?: number | null
  slotsTotal: number
  slotsUsed: number
  isPublic?: boolean
}

export function ShipSummaryCard({ ship, index, to }: { ship: ShipSummaryCardData; index: number; to?: string }) {
  const content = (
    <div
      className="rounded-sm overflow-hidden relative transition-all duration-300"
      style={{
        background: 'rgba(4,10,20,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
        cursor: to ? 'pointer' : 'default',
      }}
      onMouseEnter={e => {
        if (!to) return
        const el = e.currentTarget as HTMLDivElement
        el.style.border = `1px solid ${ACCENT}55`
        el.style.boxShadow = `0 8px 48px rgba(0,0,0,0.7), 0 0 32px ${ACCENT_GLOW}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = '1px solid rgba(255,255,255,0.07)'
        el.style.boxShadow = '0 4px 32px rgba(0,0,0,0.6)'
      }}
    >
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        {ship.imageUrl ? (
          <img
            src={ship.imageUrl}
            alt={ship.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            className={to ? 'transition-transform duration-500 group-hover:scale-105' : undefined}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `radial-gradient(ellipse 80% 80% at 50% 30%, ${ACCENT_GLOW} 0%, transparent 70%),
                         linear-gradient(180deg, rgba(8,18,36,0.6) 0%, rgba(4,10,20,0.98) 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '6rem',
              color: ACCENT, opacity: 0.14, userSelect: 'none', lineHeight: 1,
            }}>
              ⚓
            </span>
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to top, rgba(4,10,20,0.98) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      <div className="px-5 pb-5 -mt-10 relative">
        <span className="inline-block text-xs px-2 py-0.5 rounded-sm mb-2"
          style={{
            background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}44`,
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
          {ship.type}
        </span>

        <h3 className="font-display font-bold text-2xl mb-1" style={{ color: '#EEF4FC', letterSpacing: '0.02em' }}>
          {ship.name}
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
          {ship.subtitle}
        </p>

        <div className="flex items-center gap-4">
          {[
            { label: 'Vida', value: ship.currentHp != null ? `${ship.currentHp}/${ship.hp}` : ship.hp },
            { label: 'Slots', value: `${ship.slotsUsed}/${ship.slotsTotal}` },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-bold text-lg" style={{ color: '#C8E0F0' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.08em' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {to && (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity group-hover:opacity-100 opacity-50"
            style={{ color: ACCENT, fontFamily: 'var(--font-ui)' }}>
            Ver ficha completa
            <span>→</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}>
      {to ? (
        <Link to={to} className="block group">
          {content}
        </Link>
      ) : content}
    </motion.div>
  )
}
