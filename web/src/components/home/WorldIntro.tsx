import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return { ref, inView }
}

export function WorldIntro() {
  const { ref, inView } = useScrollReveal()

  return (
    <section
      id="mundo"
      ref={ref}
      className="py-24 px-6"
      style={{ background: 'var(--color-abyss)' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs uppercase tracking-[0.4em] mb-3"
            style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}
          >
            O Cenário
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--color-arcano-glow)' }}
          >
            O Mar de Nuvens
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p
              className="font-body text-lg leading-relaxed mb-6"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Em Arcádia, não existe chão sólido. O mundo é um arquipélago de{' '}
              <strong style={{ color: 'var(--color-arcano-glow)' }}>ilhas flutuantes</strong>{' '}
              suspensas sobre um mar infinito de nuvens. Ninguém sabe o que existe lá embaixo —
              e os que tentaram descobrir nunca voltaram para contar.
            </p>
            <p
              className="font-body text-lg leading-relaxed mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              As ilhas são conectadas por{' '}
              <strong style={{ color: 'var(--color-arcano-glow)' }}>constelações</strong> —
              rotas aéreas marcadas pelas estrelas, conhecidas apenas pelos navegadores experientes.
              Navios movidos a vento, vapor ou magia cortam o céu entre as nações,
              carregando mercadores, aventureiros e segredos.
            </p>
            <p
              className="font-body text-lg leading-relaxed mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Você é um desses navegantes. O que te levou aos céus, só você sabe.
            </p>

            {/* Pull quote */}
            <blockquote
              className="font-body italic text-lg border-l-4 pl-5 py-1"
              style={{
                borderColor: 'var(--color-arcano)',
                color: 'var(--color-text-secondary)',
              }}
            >
              "Fennick sabia que o mar de nuvens escondia mais do que tempestades.
              Escondia respostas — e às vezes, as respostas eram piores que as perguntas."
            </blockquote>
          </motion.div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="relative"
          >
            <div
              className="w-full aspect-square max-w-md mx-auto rounded-sm overflow-hidden"
              style={{
                background: 'var(--color-deep)',
                border: '1px solid var(--color-border)',
              }}
            >
              <img
                src="/assets/images/arcadia_summary.jpg"
                alt="Mapa do Mar de Nuvens"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
