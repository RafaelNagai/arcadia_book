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
              className="w-full aspect-square max-w-md mx-auto rounded-sm flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'var(--color-deep)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Real map image (optional) */}
              <img
                src="/assets/images/map.jpg"
                alt="Mapa do Mar de Nuvens"
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {/* SVG mock map */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Grid lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1="0" y1={i * 40} x2="400" y2={i * 40}
                    stroke="#2A3A60" strokeWidth="0.5" strokeDasharray="2,4"
                  />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * 40} y1="0" x2={i * 40} y2="400"
                    stroke="#2A3A60" strokeWidth="0.5" strokeDasharray="2,4"
                  />
                ))}
                {/* Islands */}
                <ellipse cx="120" cy="100" rx="45" ry="30" fill="#1A2440" stroke="#2A3A60" strokeWidth="1" />
                <text x="120" y="104" textAnchor="middle" fill="#7A5516" fontSize="9" fontFamily="serif">Union</text>
                <ellipse cx="280" cy="80" rx="40" ry="25" fill="#1A2440" stroke="#2A3A60" strokeWidth="1" />
                <text x="280" y="84" textAnchor="middle" fill="#7A5516" fontSize="9" fontFamily="serif">Britannia</text>
                <ellipse cx="200" cy="200" rx="55" ry="35" fill="#1A2440" stroke="#2A3A60" strokeWidth="1" />
                <text x="200" y="204" textAnchor="middle" fill="#7A5516" fontSize="9" fontFamily="serif">Camelot</text>
                <ellipse cx="90" cy="290" rx="42" ry="28" fill="#1A2440" stroke="#2A3A60" strokeWidth="1" />
                <text x="90" y="294" textAnchor="middle" fill="#7A5516" fontSize="9" fontFamily="serif">Galahad</text>
                <ellipse cx="310" cy="270" rx="38" ry="24" fill="#1A2440" stroke="#2A3A60" strokeWidth="1" />
                <text x="310" y="274" textAnchor="middle" fill="#7A5516" fontSize="9" fontFamily="serif">Rubra</text>
                {/* Routes */}
                <line x1="120" y1="100" x2="280" y2="80" stroke="#7A5516" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.6" />
                <line x1="120" y1="100" x2="200" y2="200" stroke="#7A5516" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.6" />
                <line x1="280" y1="80" x2="200" y2="200" stroke="#7A5516" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.6" />
                <line x1="200" y1="200" x2="90" y2="290" stroke="#7A5516" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.6" />
                <line x1="200" y1="200" x2="310" y2="270" stroke="#7A5516" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.6" />
              </svg>
              {/* Label */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span
                  className="text-xs uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  [ Mapa: substituir por arte final ]
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
