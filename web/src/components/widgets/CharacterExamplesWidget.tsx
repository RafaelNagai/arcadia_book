import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Character } from '@/data/characterTypes'
import charactersData from '@characters'

const CHARACTERS = charactersData as Character[]

const ELEMENT_COLORS: Record<string, { text: string; glow: string; bg: string }> = {
  'Energia':   { text: '#E8803A', glow: 'rgba(232,128,58,0.4)',  bg: 'rgba(200,90,32,0.12)' },
  'Anomalia':  { text: '#6FC892', glow: 'rgba(111,200,146,0.4)', bg: 'rgba(42,155,111,0.12)' },
  'Paradoxo':  { text: '#50C8E8', glow: 'rgba(80,200,232,0.4)',  bg: 'rgba(32,143,168,0.12)' },
  'Astral':    { text: '#C090F0', glow: 'rgba(192,144,240,0.4)', bg: 'rgba(107,63,160,0.12)' },
  'Cognitivo': { text: '#E8B84B', glow: 'rgba(232,184,75,0.4)',  bg: 'rgba(200,146,42,0.12)' },
}
const DEFAULT_ACCENT = { text: '#C8E0F0', glow: 'rgba(200,224,240,0.3)', bg: 'rgba(32,96,160,0.12)' }

function getAccent(el: string | null | undefined) {
  return el ? (ELEMENT_COLORS[el] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT
}

const ATTR_ORDER = ['fisico', 'destreza', 'intelecto', 'influencia'] as const
const ATTR_LABELS: Record<string, string> = {
  fisico: 'Fís', destreza: 'Des', intelecto: 'Int', influencia: 'Inf',
}
const ATTR_COLORS: Record<string, string> = {
  fisico: '#C04040', destreza: '#20A080', intelecto: '#4080C0', influencia: '#A060C0',
}

export function CharacterExamplesWidget() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {CHARACTERS.map((char, i) => {
          const accent = getAccent(char.afinidade)
          const topSkill = Object.entries(char.skills)
            .sort((a, b) => b[1] - a[1])[0][0]
            .replace('percepcao', 'Percepção')
            .replace('intuicao', 'Intuição')
            .replace('investigacao', 'Investigação')
            .replace('dominacao', 'Dominação')
            .replace('persuasao', 'Persuasão')
            .replace('vontade', 'Vontade')
            .replace('atletismo', 'Atletismo')
            .replace('combate', 'Combate')
            .replace('furtividade', 'Furtividade')
            .replace('precisao', 'Precisão')
            .replace('acrobacia', 'Acrobacia')
            .replace('reflexo', 'Reflexo')
            .replace('conhecimento', 'Conhecimento')
            .replace('empatia', 'Empatia')
            .replace('performance', 'Performance')
            .replace('fortitude', 'Fortitude')

          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <Link
                to={`/ficha/${char.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-sm overflow-hidden group transition-all duration-200"
                style={{
                  background: 'rgba(4,10,20,0.95)',
                  border: `1px solid ${accent.text}2A`,
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${accent.text}66`
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 4px 32px ${accent.glow}`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${accent.text}2A`
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                {/* Portrait area */}
                <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
                  {char.image ? (
                    <img
                      src={char.image}
                      alt={char.name}
                      className="transition-transform duration-500 group-hover:scale-105"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: `radial-gradient(ellipse 80% 80% at 50% 30%, ${accent.glow} 0%, transparent 70%),
                                   linear-gradient(180deg, rgba(8,18,36,0.5) 0%, rgba(4,10,20,1) 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '5rem',
                        color: accent.text,
                        opacity: 0.15,
                        userSelect: 'none',
                        lineHeight: 1,
                      }}>
                        {char.name[0]}
                      </span>
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(4,10,20,1) 0%, transparent 100%)',
                    pointerEvents: 'none',
                  }} />
                </div>

                {/* Info */}
                <div className="px-4 pb-4 -mt-6 relative">
                  {/* Race badge */}
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-ui)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    color: accent.text,
                    background: accent.bg,
                    border: `1px solid ${accent.text}44`,
                    borderRadius: 2,
                    padding: '1px 6px',
                    marginBottom: 6,
                  }}>
                    {char.race}
                  </span>

                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#EEF4FC',
                    marginBottom: 2,
                    letterSpacing: '0.02em',
                  }}>
                    {char.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    lineHeight: 1.4,
                  }}>
                    {char.concept}
                  </p>

                  {/* Attribute mini-bar */}
                  <div className="flex items-center gap-1 mb-3">
                    {ATTR_ORDER.map(attr => (
                      <div key={attr} className="flex flex-col items-center gap-0.5 flex-1">
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: ATTR_COLORS[attr],
                          lineHeight: 1,
                        }}>
                          {char.attributes[attr]}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.55rem',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}>
                          {ATTR_LABELS[attr]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Afinidade + top skill */}
                  <div className="flex items-center justify-between gap-2">
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.65rem',
                      color: accent.text,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {char.afinidade}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                    }}>
                      {topSkill}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-3 text-xs font-semibold uppercase tracking-wider opacity-40 group-hover:opacity-80 transition-opacity"
                    style={{ color: accent.text, fontFamily: 'var(--font-ui)' }}>
                    Ver ficha →
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
