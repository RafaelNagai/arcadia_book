import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Character } from '@/data/characterTypes'
import charactersData from '@characters'

const CHARACTERS = charactersData as Character[]

const ELEMENT_COLORS: Record<string, { text: string; glow: string }> = {
  'Energia':   { text: '#E8803A', glow: 'rgba(232,128,58,0.35)' },
  'Anomalia':  { text: '#6FC892', glow: 'rgba(111,200,146,0.35)' },
  'Paradoxo':  { text: '#50C8E8', glow: 'rgba(80,200,232,0.35)' },
  'Astral':    { text: '#C090F0', glow: 'rgba(192,144,240,0.35)' },
  'Cognitivo': { text: '#E8B84B', glow: 'rgba(232,184,75,0.35)' },
}
const DEFAULT_ACCENT = { text: '#80A8C8', glow: 'rgba(128,168,200,0.25)' }

function getAccent(element: string | null) {
  return element ? (ELEMENT_COLORS[element] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT
}

function CharacterCard({ character, index }: { character: Character; index: number }) {
  const accent = getAccent(character.afinidade)
  const totalSkillPoints = Object.values(character.skills).reduce((s, v) => s + v, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}>
      <Link to={`/ficha/${character.id}`} className="block group">
        <div
          className="rounded-sm overflow-hidden relative transition-all duration-300"
          style={{
            background: 'rgba(4,10,20,0.95)',
            border: `1px solid rgba(255,255,255,0.07)`,
            boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.border = `1px solid ${accent.text}55`
            el.style.boxShadow = `0 8px 48px rgba(0,0,0,0.7), 0 0 32px ${accent.glow}`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.border = '1px solid rgba(255,255,255,0.07)'
            el.style.boxShadow = '0 4px 32px rgba(0,0,0,0.6)'
          }}>

          {/* Portrait area */}
          <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
            {character.image ? (
              <img
                src={character.image}
                alt={character.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                className="transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `
                  radial-gradient(ellipse 80% 80% at 50% 30%, ${accent.glow} 0%, transparent 70%),
                  linear-gradient(180deg, rgba(8,18,36,0.6) 0%, rgba(4,10,20,0.98) 100%)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Decorative grid */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  backgroundImage: `repeating-linear-gradient(0deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 40px),
                                    repeating-linear-gradient(90deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 40px)`,
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '8rem',
                  color: accent.text,
                  opacity: 0.12,
                  userSelect: 'none',
                  lineHeight: 1,
                }}>
                  {character.name[0]}
                </span>
              </div>
            )}
            {/* Bottom gradient */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
              background: 'linear-gradient(to top, rgba(4,10,20,0.98) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Info */}
          <div className="px-5 pb-5 -mt-10 relative">
            {/* Race tag */}
            <span className="inline-block text-xs px-2 py-0.5 rounded-sm mb-2"
              style={{
                background: `${accent.text}18`,
                color: accent.text,
                border: `1px solid ${accent.text}44`,
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
              {character.race}
            </span>

            <h3 className="font-display font-bold text-2xl mb-1" style={{ color: '#EEF4FC', letterSpacing: '0.02em' }}>
              {character.name}
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
              {character.concept}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-4">
              {[
                { label: 'Nível', value: character.level },
                { label: 'HP', value: character.hp },
                { label: 'Perícias', value: totalSkillPoints },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="font-display font-bold text-lg" style={{ color: '#C8E0F0' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Afinidade */}
            {character.afinidade && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                  Afinidade
                </span>
                <span className="text-xs font-semibold" style={{ color: accent.text, fontFamily: 'var(--font-ui)' }}>
                  {character.afinidade}
                </span>
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity group-hover:opacity-100 opacity-50"
              style={{ color: accent.text, fontFamily: 'var(--font-ui)' }}>
              Ver ficha completa
              <span>→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function CharacterListPage() {
  useEffect(() => {
    document.title = 'Personagens — Arcádia'
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: 'var(--color-abyss)' }}>

      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(8,18,36,0.9) 0%, var(--color-abyss) 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '4rem 2rem 3rem',
        }}>
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: `repeating-linear-gradient(0deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(90deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px)`,
          pointerEvents: 'none',
        }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}>
            Fichas de Personagem
          </p>
          <h1 className="font-display font-bold text-4xl mb-3" style={{ color: '#EEF4FC', letterSpacing: '-0.01em' }}>
            Personagens Pré-criados
          </h1>
          <p className="font-body text-base" style={{ color: 'var(--color-text-secondary)', maxWidth: 520 }}>
            Aventureiros prontos para o Mar de Nuvens. Escolha um e mergulhe na história.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHARACTERS.map((character, i) => (
            <CharacterCard key={character.id} character={character} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
