import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

const PILLARS = [
  {
    number: '01',
    title: 'Exploração de Alto Risco',
    body: 'Cada viagem é uma aposta. Recursos limitados, clima imprevisível e ilhas inexploradas criam tensão constante. A recompensa raramente é só ouro — é conhecimento, poder e sobrevivência.',
    slug: 'introducao',
  },
  {
    number: '02',
    title: 'Gestão de Tripulação',
    body: 'Seus aliados não são personagens passivos. A Moral da Tripulação é um recurso tão valioso quanto munição. Um grito de guerra pode virar uma batalha; a perda de um companheiro pode destruir a equipe.',
    slug: 'moral',
  },
  {
    number: '03',
    title: 'Magia Criativa e Perigosa',
    body: 'O Arcanismo não tem lista de feitiços. Você combina Runas e Intenção para criar efeitos únicos — mas cada uso cobra um preço em Sanidade. Poder demais te torna algo que não é mais humano.',
    slug: 'arcanismo',
  },
  {
    number: '04',
    title: 'Combate Dinâmico',
    body: 'Duas ações, reações ilimitadas (mas com custo crescente), e qualquer perícia pode ser usada criativamente. Não existe lista de manobras — existe o que você consegue justificar.',
    slug: 'combate',
  },
]

const MECHANICS = [
  {
    icon: '⬡⬡',
    title: '2D12',
    subtitle: 'O Sistema Central',
    body: 'Role 2D12 e some com Atributo + Perícia contra uma Dificuldade. Tire 12 natural nos dois dados — um Milagre — e sua perícia evolui permanentemente. Experiência não é um número: é o que você viveu.',
    slug: 'evolucao-e-testes',
    accent: 'var(--color-arcano-glow)',
  },
  {
    icon: '◈',
    title: 'Moral',
    subtitle: 'O Espírito da Tripulação',
    body: '5D12 formam o Pote de Moral. O Grito de Guerra converte dados ruins em sucessos. Quando o pote esvazia, a tripulação entra em colapso — e nenhuma magia do mundo vai salvar um navio sem moral.',
    slug: 'moral',
    accent: 'var(--color-astral-glow)',
  },
  {
    icon: '✦',
    title: 'Arcanismo',
    subtitle: 'O Poder e seu Preço',
    body: 'Cinco elementos, intenções livres, Runas como vocabulário. Cada uso drena Sanidade. Três traumas e você mergulha na Loucura — um minijogo de sobrevivência mental onde as regras mudam.',
    slug: 'arcanismo',
    accent: '#9B6FD0',
  },
]

export function MechanicsHighlight() {
  const pillarsRef = useRef<HTMLDivElement>(null)
  const mechRef = useRef<HTMLDivElement>(null)
  const pillarsInView = useInView(pillarsRef, { once: true, margin: '-60px' })
  const mechInView = useInView(mechRef, { once: true, margin: '-60px' })

  return (
    <>
      {/* Pillars section */}
      <section
        className="py-24 px-6"
        style={{ background: 'var(--color-deep)' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
            ref={pillarsRef}
          >
            <p
              className="text-xs uppercase tracking-[0.4em] mb-3"
              style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}
            >
              O que define Arcádia
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Quatro Pilares da Experiência
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 24 }}
                animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Link
                  to={`/capitulo/${pillar.slug}`}
                  className="group block h-full p-6 rounded-sm border relative overflow-hidden transition-all duration-200 hover:border-opacity-60"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {/* Background number */}
                  <span
                    className="absolute top-3 right-4 font-display font-bold select-none pointer-events-none"
                    style={{ fontSize: '5rem', color: 'var(--color-arcano)', opacity: 0.04, lineHeight: 1 }}
                  >
                    {pillar.number}
                  </span>
                  {/* Hover border glow */}
                  <div
                    className="absolute inset-0 border opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ borderColor: 'var(--color-arcano-dim)', borderRadius: 2 }}
                  />
                  <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}
                  >
                    Pilar {pillar.number}
                  </p>
                  <h3
                    className="font-display text-lg font-semibold mb-3 group-hover:text-arcano-glow transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className="font-body text-base leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {pillar.body}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core mechanics section */}
      <section
        className="py-24 px-6"
        style={{ background: 'var(--color-abyss)' }}
        ref={mechRef}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mechInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p
              className="text-xs uppercase tracking-[0.4em] mb-3"
              style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}
            >
              Mecânicas Centrais
            </p>
            <h2
              className="font-display text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              O Sistema em Três Conceitos
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {MECHANICS.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 24 }}
                animate={mechInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Link
                  to={`/capitulo/${m.slug}`}
                  className="group flex flex-col h-full p-7 rounded-sm border relative overflow-hidden transition-all duration-200"
                  style={{
                    background: 'var(--color-deep)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {/* Icon */}
                  <span
                    className="text-3xl mb-4 block transition-colors duration-300"
                    style={{ color: m.accent }}
                  >
                    {m.icon}
                  </span>
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
                  >
                    {m.subtitle}
                  </p>
                  <h3
                    className="font-display text-2xl font-bold mb-4"
                    style={{ color: m.accent }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="font-body text-base leading-relaxed flex-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {m.body}
                  </p>
                  <span
                    className="mt-6 text-xs uppercase tracking-wider font-ui transition-colors duration-200 group-hover:opacity-80"
                    style={{ color: m.accent }}
                  >
                    Ler capítulo →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
