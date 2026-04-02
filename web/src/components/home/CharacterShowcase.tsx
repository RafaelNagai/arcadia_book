import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

const RACES = [
  {
    name: 'Humano',
    trait: 'Adaptável e ambicioso',
    description: 'Os mais numerosos do arquipélago. Encontrados em todas as nações, dominando política e comércio por pura persistência.',
    color: 'var(--color-arcano)',
  },
  {
    name: 'Elfo',
    trait: 'Hierárquico e ancestral',
    description: 'Organizam-se em anéis numerados no coração de Galahad. Quanto maior o número, mais próximo do centro — e do poder.',
    color: 'var(--color-arcano-glow)',
  },
  {
    name: 'Elfo Noturno',
    trait: 'Nômade e ritualístico',
    description: 'Exilados das florestas de Galahad, habitam o Norte gelado. Suas tradições são incompreensíveis para os outros povos.',
    color: '#7A9BC8',
  },
  {
    name: 'Orc',
    trait: 'Guerreiro e honrado',
    description: 'Mal compreendidos pela maioria. Para os Orcs, a honra não é conceito abstrato — é a única moeda que importa.',
    color: '#4A8A5A',
  },
  {
    name: 'Anão',
    trait: 'Engenheiro e controlador',
    description: 'Controlam Britannia e o monopólio do Eltys, o minério arcano. Sua engenharia constrói os navios mais poderosos do céu.',
    color: '#9B6FD0',
  },
  {
    name: 'Avaro',
    trait: 'Misterioso e solitário',
    description: 'Raça rara, de origens obscuras. Poucos os conhecem bem — e eles preferem assim. O que sabem sobre si mesmos, guardam.',
    color: '#C87A6E',
  },
]

export function CharacterShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      className="py-24 px-6 overflow-hidden"
      style={{ background: 'var(--color-deep)' }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs uppercase tracking-[0.4em] mb-3"
            style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}
          >
            Os Povos do Arquipélago
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Quem você será?
          </h2>
          <p
            className="font-body text-lg max-w-lg mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Em Arcádia, raça não define seus números — define sua história.
            Nenhuma raça tem vantagem mecânica. Todas têm identidade.
          </p>
        </motion.div>

        {/* Race cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {RACES.map((race, i) => (
            <motion.div
              key={race.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative p-5 rounded-sm border transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-300 opacity-40 group-hover:opacity-100"
                style={{ background: race.color }}
              />
              {/* Race silhouette placeholder */}
              <div
                className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
                style={{ background: `${race.color}15`, border: `1px solid ${race.color}30` }}
              >
                <img
                  src={`/assets/images/races/${race.name.toLowerCase().replace(' ', '-')}.png`}
                  alt=""
                  className="w-8 h-8 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span style={{ color: race.color, fontSize: '1.2rem' }}>◈</span>
              </div>
              <h3
                className="font-display font-semibold text-base mb-1"
                style={{ color: race.color }}
              >
                {race.name}
              </h3>
              <p
                className="text-xs mb-3 uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                {race.trait}
              </p>
              <p
                className="font-body text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {race.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-center"
        >
          <Link
            to="/capitulo/racas"
            className="inline-block px-8 py-3 font-ui font-semibold text-sm uppercase tracking-widest border transition-all duration-200 hover:bg-white hover:bg-opacity-5"
            style={{
              borderColor: 'var(--color-arcano-dim)',
              color: 'var(--color-arcano-glow)',
              borderRadius: 2,
            }}
          >
            Explorar todas as raças →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
