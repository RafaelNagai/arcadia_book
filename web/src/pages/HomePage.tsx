import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { HeroParallax } from '@/components/parallax/HeroParallax'
import { WorldIntro } from '@/components/home/WorldIntro'
import { MechanicsHighlight } from '@/components/home/MechanicsHighlight'
import { CharacterShowcase } from '@/components/home/CharacterShowcase'

function CtaStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-28 px-6 text-center relative overflow-hidden"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(200,146,42,0.08) 0%, transparent 65%)',
        }}
      />
      <div className="relative max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.4em] mb-6"
          style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}
        >
          O Mar de Nuvens aguarda
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-3xl md:text-5xl font-bold mb-8"
          style={{ color: 'var(--color-arcano-glow)', letterSpacing: '0.05em' }}
        >
          Navegue pelo desconhecido.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-body text-lg mb-10"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          15 capítulos, um sistema completo, um mundo vasto.
          Comece pelo começo — ou pule direto para o que importa.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/capitulo/introducao"
            className="px-10 py-4 font-ui font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:brightness-110"
            style={{
              background: 'var(--color-arcano)',
              color: '#04060C',
              borderRadius: 2,
              letterSpacing: '0.15em',
            }}
          >
            Ler Introdução
          </Link>
          <Link
            to="/capitulo/combate"
            className="px-10 py-4 font-ui font-semibold text-sm uppercase tracking-widest border transition-all duration-200 hover:bg-white hover:bg-opacity-5"
            style={{
              borderColor: 'var(--color-arcano-dim)',
              color: 'var(--color-text-secondary)',
              borderRadius: 2,
              letterSpacing: '0.15em',
            }}
          >
            Ver Combate
          </Link>
        </motion.div>
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

      {/* Final CTA */}
      <CtaStrip />

      <Footer />
    </div>
  )
}
