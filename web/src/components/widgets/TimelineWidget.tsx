import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TIMELINE_EVENTS, ERAS, type Era, type TimelineEvent } from '@/data/timelineEvents'

const ERA_COLORS: Record<Era, { line: string; text: string; badgeBg: string; headerBg: string }> = {
  'Período Existencial': { line: '#C090F0', text: '#C090F0', badgeBg: 'rgba(107,63,160,0.22)', headerBg: 'rgba(107,63,160,0.08)' },
  'Era Zero':            { line: '#50C8E8', text: '#50C8E8', badgeBg: 'rgba(32,143,168,0.22)',  headerBg: 'rgba(32,143,168,0.08)'  },
  'Era Expansão':        { line: '#6FC892', text: '#6FC892', badgeBg: 'rgba(42,155,111,0.22)',  headerBg: 'rgba(42,155,111,0.08)'  },
  'Era Imperial':        { line: '#E8803A', text: '#E8803A', badgeBg: 'rgba(200,90,32,0.22)',   headerBg: 'rgba(200,90,32,0.08)'   },
  'Era Zohar':           { line: '#E8B84B', text: '#E8B84B', badgeBg: 'rgba(200,146,42,0.22)',  headerBg: 'rgba(200,146,42,0.08)'  },
}

/* ─── Year parsing ──────────────────────────────────────────────────
   Converts "day/year" and "day/Xyear" to a comparable integer.
   For count-down eras (Período Existencial, Era Zero) the year
   numbers decrease as time progresses, so we invert them before
   computing gaps — handled per-era in buildEraGroups below.
──────────────────────────────────────────────────────────────────── */
function parseYear(yearStr: string): number {
  const [dayStr, rawYear] = yearStr.split('/')
  const day = parseInt(dayStr, 10)
  const year = parseInt(rawYear.replace('X', ''), 10)
  return year * 100 + day
}

/* ─── Per-era spacing ───────────────────────────────────────────────
   Returns an array of spacer heights (px) between consecutive events.
   Index i → spacer BEFORE event i (0 for the first event).
   Min: 12px  Max: 80px, scaled to the largest gap within the era.
──────────────────────────────────────────────────────────────────── */
const MIN_GAP = 12
const MAX_GAP = 80

function buildSpacers(events: TimelineEvent[]): number[] {
  if (events.length <= 1) return events.map(() => 0)

  const nums = events.map(e => parseYear(e.year))
  // Detect if the era counts down (year numbers decrease over time)
  const countsDown = nums[0] > nums[nums.length - 1]
  const ordered = countsDown ? nums.map(n => -n) : nums

  const gaps = ordered.slice(1).map((n, i) => Math.abs(n - ordered[i]))
  const maxGap = Math.max(...gaps, 1)

  return [0, ...gaps.map(g => MIN_GAP + Math.round((g / maxGap) * (MAX_GAP - MIN_GAP)))]
}

/* ─── Event card ────────────────────────────────────────────────── */

function EventCard({
  event,
  isOpen,
  onToggle,
  colors,
  spacerHeight,
}: {
  event: TimelineEvent
  isOpen: boolean
  onToggle: () => void
  colors: typeof ERA_COLORS[Era]
  spacerHeight: number
}) {
  return (
    <>
      {/* Proportional spacer on the timeline stem */}
      {spacerHeight > 0 && (
        <div style={{ height: spacerHeight, display: 'flex' }}>
          <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 1, height: '100%', background: 'var(--color-border)' }} />
          </div>
        </div>
      )}

      {/* Event row */}
      <div className="flex gap-3">
        {/* Dot + stem */}
        <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `2px solid ${colors.line}`,
              background: isOpen ? colors.line : 'var(--color-deep)',
              boxShadow: isOpen ? `0 0 8px ${colors.line}99` : 'none',
              transition: 'all 0.2s',
              flexShrink: 0,
              marginTop: 4,
            }}
          />
          <div style={{ width: 1, flex: 1, background: 'var(--color-border)', marginTop: 4 }} />
        </div>

        {/* Card */}
        <div className="flex-1 pb-1">
          <button
            onClick={onToggle}
            className="w-full text-left rounded border transition-all duration-200 hover:brightness-110"
            style={{
              background: isOpen ? 'rgba(15,23,41,0.8)' : 'rgba(15,23,41,0.45)',
              borderColor: isOpen ? colors.line + '55' : 'var(--color-border)',
            }}
          >
            <div className="px-3 py-2.5 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span
                    className="text-xs font-ui font-semibold px-2 py-0.5 rounded"
                    style={{ background: colors.badgeBg, color: colors.text }}
                  >
                    {event.year}
                  </span>
                  {event.isRpgCampaign && (
                    <span
                      className="text-xs font-ui font-semibold px-2 py-0.5 rounded"
                      style={{ background: 'rgba(200,146,42,0.18)', color: '#E8B84B', border: '1px solid rgba(200,146,42,0.35)' }}
                    >
                      ✦ Campanha RPG
                    </span>
                  )}
                </div>
                <p className="font-display font-semibold text-sm leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                  {event.title}
                </p>
              </div>
              <span
                className="text-xs font-ui mt-1 flex-shrink-0"
                style={{
                  color: 'var(--color-text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              >
                ▾
              </span>
            </div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="rounded-b border-x border-b overflow-hidden"
                  style={{ borderColor: colors.line + '44', background: 'rgba(10,15,30,0.65)' }}
                >
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full object-cover"
                      style={{ maxHeight: 160, borderBottom: `1px solid ${colors.line}33` }}
                    />
                  )}
                  <p className="px-3 py-2.5 text-sm font-body leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {event.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

/* ─── Era section header ────────────────────────────────────────── */

function EraHeader({ era, colors }: { era: Era; colors: typeof ERA_COLORS[Era] }) {
  return (
    <div className="flex gap-3 items-center mb-3">
      <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: colors.line,
            boxShadow: `0 0 10px ${colors.line}bb`,
          }}
        />
      </div>
      <div
        className="flex-1 px-3 py-1.5 rounded"
        style={{ background: colors.headerBg, borderLeft: `3px solid ${colors.line}` }}
      >
        <span className="font-display font-bold text-sm" style={{ color: colors.text }}>
          {era}
        </span>
      </div>
    </div>
  )
}

/* ─── Main widget ────────────────────────────────────────────────── */

export function TimelineWidget() {
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id))

  const byEra = ERAS.map(era => {
    const events = TIMELINE_EVENTS.filter(e => e.era === era && e.isVisible !== false)
    return { era, colors: ERA_COLORS[era], events, spacers: buildSpacers(events) }
  }).filter(({ events }) => events.length > 0)

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ background: 'var(--color-deep)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <span style={{ color: 'var(--color-arcano)', fontSize: '1.1rem' }}>✦</span>
        <div>
          <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-arcano-glow)' }}>
            Timeline de Arcádia
          </h3>
          <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--color-text-muted)' }}>
            Clique em um evento para expandir
          </p>
        </div>
      </div>

      <div className="p-5">
        {byEra.map(({ era, colors, events, spacers }, eraIdx) => (
          <div key={era}>
            {/* Gap between eras */}
            {eraIdx > 0 && <div style={{ height: 24 }} />}

            <EraHeader era={era} colors={colors} />

            {events.map((event, evIdx) => (
              <EventCard
                key={event.id}
                event={event}
                isOpen={openId === event.id}
                onToggle={() => toggle(event.id)}
                colors={colors}
                spacerHeight={spacers[evIdx]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
