import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { HeroParallax } from '@/components/parallax/HeroParallax'
import { WorldIntro } from '@/components/home/WorldIntro'
import { MechanicsHighlight } from '@/components/home/MechanicsHighlight'
import { CharacterShowcase } from '@/components/home/CharacterShowcase'
import versionData from '@version'

const DOORS = [
  {
    tag: 'Comece aqui',
    title: 'Ler o Livro',
    description: 'Regras completas, lore, bestiário e referência do sistema 2D12. Do básico ao avançado.',
    cta: 'Começar a ler',
    to: '/capitulo/introducao',
    accent: {
      text: '#C8922A',
      bgIdle: 'rgba(200,146,42,0.04)',
      bgHover: 'rgba(200,146,42,0.08)',
      border: 'rgba(200,146,42,0.3)',
      glow: '0 8px 48px rgba(200,146,42,0.18), 0 0 0 1px rgba(200,146,42,0.4)',
    },
  },
  {
    tag: null,
    title: 'Ir para a Mesa',
    description: 'Crie personagens, gerencie fichas e prepare suas campanhas no Mar de Nuvens.',
    cta: 'Abrir a Mesa',
    to: '/personagens',
    accent: {
      text: '#80A8C8',
      bgIdle: 'rgba(10,16,32,0.6)',
      bgHover: 'rgba(128,168,200,0.05)',
      border: 'rgba(128,168,200,0.18)',
      glow: '0 8px 48px rgba(128,168,200,0.12), 0 0 0 1px rgba(128,168,200,0.28)',
    },
  },
]

function TwoDoorsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-28 px-6 relative overflow-hidden"
      style={{ background: 'var(--color-void)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(200,146,42,0.05) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-xs uppercase tracking-[0.35em] mb-12"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
        >
          Por onde começar?
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DOORS.map((door, i) => (
            <motion.div
              key={door.to}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.13 }}
              className="h-full"
            >
              <Link to={door.to} className="block group h-full">
                <div
                  className="h-full flex flex-col p-8 transition-all duration-300"
                  style={{
                    background: door.accent.bgIdle,
                    border: `1px solid ${door.accent.border}`,
                    borderRadius: 4,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.background = door.accent.bgHover
                    el.style.boxShadow = door.accent.glow
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.background = door.accent.bgIdle
                    el.style.boxShadow = 'none'
                  }}
                >
                  {door.tag && (
                    <span
                      className="inline-block text-xs px-2 py-0.5 mb-6 self-start"
                      style={{
                        background: `${door.accent.text}18`,
                        color: door.accent.text,
                        border: `1px solid ${door.accent.border}`,
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        borderRadius: 2,
                      }}
                    >
                      {door.tag}
                    </span>
                  )}

                  {!door.tag && <div className="mb-[2.125rem]" />}

                  <h2
                    className="font-display font-bold mb-4"
                    style={{ fontSize: '1.6rem', color: door.accent.text, letterSpacing: '0.02em' }}
                  >
                    {door.title}
                  </h2>

                  <p
                    className="font-body text-sm leading-relaxed flex-1 mb-8"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {door.description}
                  </p>

                  <span
                    className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: door.accent.text, fontFamily: 'var(--font-ui)' }}
                  >
                    {door.cta}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      className="py-8 px-6 text-center border-t"
      style={{
        background: 'var(--color-void)',
        borderColor: 'var(--color-border)',
      }}
    >
      <p
        className="font-display text-sm tracking-widest mb-2"
        style={{ color: 'var(--color-arcano-dim)' }}
      >
        ARCÁDIA
      </p>
      <p
        className="text-xs"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
      >
        Sistema de RPG de Mesa — Livro do Sistema
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', opacity: 0.4 }}
      >
        v{versionData.version}
      </p>
    </footer>
  )
}

export function HomePage() {
  useEffect(() => {
    document.title = 'Arcádia — Sistema de RPG de Mesa'
  }, [])

  return (
    <div style={{ background: 'var(--color-abyss)' }}>
      {/* Hero with parallax — full viewport */}
      <HeroParallax />

      {/* World introduction */}
      <WorldIntro />

      {/* Mechanics: 4 pillars + 3 core mechanics */}
      <MechanicsHighlight />

      {/* Race showcase */}
      <CharacterShowcase />

      {/* Two doors: Livro / Mesa */}
      <TwoDoorsSection />

      <Footer />
    </div>
  )
}
