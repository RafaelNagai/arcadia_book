import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ParallaxLayer } from './ParallaxLayer'

/* ─── Layer components ──────────────────────────────────────────── */

function SkyLayer() {
  return (
    <>
      {/* Intro video — base da cena */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.65 }}
      >
        {/* .mov funciona no Safari; adicione uma versão .mp4 para Chrome/Firefox */}
        <source src="/assets/videos/intro_arcadia.mov" type="video/quicktime" />
        <source src="/assets/videos/intro_arcadia.mov" type="video/mp4" />
      </video>

      {/* Imagem estática opcional (substitui o mock depois) */}
      <img
        src="/assets/images/layers/sky.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />

      {/* Gradiente escuro sobre o vídeo — garante legibilidade e atmosphera */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 85%, rgba(45,90,158,0.45) 0%, rgba(26,58,110,0.35) 30%, rgba(13,27,62,0.55) 60%, rgba(4,6,12,0.75) 100%)',
        }}
      />

      {/* Estrelas — aparecem mesmo sem vídeo */}
      <div className="absolute inset-0" style={{ opacity: 0.5 }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 7 === 0 ? 2 : 1,
              height: i % 7 === 0 ? 2 : 1,
              background: '#E8E0D0',
              top: `${(i * 13.7) % 70}%`,
              left: `${(i * 17.3) % 100}%`,
              opacity: (i % 5) * 0.15 + 0.2,
            }}
          />
        ))}
      </div>
    </>
  )
}

function CloudLayer() {
  return (
    <>
      <img
        src="/assets/images/layers/clouds-far-a.png"
        alt=""
        className="absolute w-full h-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <img
        src="/assets/images/layers/clouds-far-b.png"
        alt=""
        className="absolute w-full h-full object-cover"
        style={{ opacity: 0.6 }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {/* Mock clouds */}
      <div className="absolute inset-0">
        {[
          { top: '55%', left: '-5%', width: '50vw', height: 120, delay: '0s', duration: '80s' },
          { top: '62%', left: '20%', width: '45vw', height: 90, delay: '-30s', duration: '70s' },
          { top: '70%', left: '60%', width: '40vw', height: 80, delay: '-50s', duration: '90s' },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: c.top,
              left: c.left,
              width: c.width,
              height: c.height,
              background: 'radial-gradient(ellipse, rgba(122,155,200,0.15) 0%, transparent 70%)',
              filter: 'blur(30px)',
              animation: `cloudDrift ${c.duration} linear ${c.delay} infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
}

function FarIslandsLayer() {
  return (
    <>
      <img
        src="/assets/images/layers/islands-far.png"
        alt=""
        className="absolute bottom-0 w-full"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="280" cy="200" rx="240" ry="35" fill="#0D1B3E" opacity="0.9" />
        <ellipse cx="280" cy="195" rx="180" ry="20" fill="#0F1729" opacity="0.8" />
        <ellipse cx="850" cy="195" rx="200" ry="28" fill="#0D1B3E" opacity="0.85" />
        <ellipse cx="850" cy="190" rx="150" ry="18" fill="#0A1525" opacity="0.7" />
        <ellipse cx="1260" cy="205" rx="160" ry="22" fill="#0F1729" opacity="0.9" />
        <ellipse cx="1260" cy="200" rx="110" ry="15" fill="#0D1B3E" opacity="0.75" />
      </svg>
    </>
  )
}

function NearIslandsLayer() {
  return (
    <>
      <img
        src="/assets/images/layers/island-near-left.png"
        alt=""
        className="absolute bottom-0 left-0 h-3/4 object-contain object-bottom-left"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <img
        src="/assets/images/layers/island-near-right.png"
        alt=""
        className="absolute bottom-0 right-0 h-3/4 object-contain object-bottom-right"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 300"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 -4px 24px rgba(45,90,158,0.35))' }}
      >
        <path
          d="M0,300 L0,200 Q40,170 80,185 Q130,155 180,168 Q220,145 260,160 Q280,150 300,165 L320,180 Q340,185 360,175 L420,180 L420,300 Z"
          fill="#111C35"
        />
        <path
          d="M0,300 L0,220 Q60,200 120,210 Q180,195 240,205 Q300,198 360,208 L420,210 L420,300 Z"
          fill="#0D1729"
        />
        <path
          d="M1020,300 L1020,185 Q1060,160 1100,170 Q1150,148 1200,160 Q1240,145 1280,158 Q1320,152 1360,165 L1400,170 Q1430,175 1440,168 L1440,300 Z"
          fill="#111C35"
        />
        <path
          d="M1020,300 L1020,205 Q1080,192 1140,200 Q1200,190 1260,198 Q1320,194 1380,202 L1440,200 L1440,300 Z"
          fill="#0D1729"
        />
      </svg>
    </>
  )
}

function ForegroundLayer() {
  return (
    <>
      <img
        src="/assets/images/layers/foreground-left.png"
        alt=""
        className="absolute bottom-0 left-0 h-full object-contain object-bottom-left"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <img
        src="/assets/images/layers/foreground-right.png"
        alt=""
        className="absolute bottom-0 right-0 h-full object-contain object-bottom-right"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {/* Mock SVG rigging */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.45 }}
      >
        <line x1="0" y1="900" x2="250" y2="300" stroke="#7A5516" strokeWidth="1.5" strokeDasharray="4,6" />
        <line x1="30" y1="900" x2="280" y2="320" stroke="#5A3A10" strokeWidth="1" strokeDasharray="3,8" />
        <line x1="-10" y1="900" x2="180" y2="280" stroke="#7A5516" strokeWidth="1" strokeDasharray="2,10" />
        <line x1="1440" y1="900" x2="1190" y2="310" stroke="#7A5516" strokeWidth="1.5" strokeDasharray="4,6" />
        <line x1="1410" y1="900" x2="1160" y2="330" stroke="#5A3A10" strokeWidth="1" strokeDasharray="3,8" />
        <line x1="1450" y1="900" x2="1260" y2="290" stroke="#7A5516" strokeWidth="1" strokeDasharray="2,10" />
        <rect x="0" y="870" width="450" height="30" fill="#0A0C14" rx="2" />
        <rect x="990" y="870" width="450" height="30" fill="#0A0C14" rx="2" />
      </svg>
    </>
  )
}

/* ─── Hero content ─────────────────────────────────────────────── */

function HeroContent() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-50"
      style={{ paddingBottom: '8vh' }}
    >
      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-xs uppercase tracking-[0.4em] mb-8"
        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-ui)' }}
      >
        Sistema de RPG de Mesa
      </motion.p>

      {/* Logo image */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.35, duration: 1, ease: 'easeOut' }}
        className="mb-10"
      >
        <img
          src="/assets/images/logo.png"
          alt="Arcádia"
          style={{
            width: 'clamp(260px, 45vw, 580px)',
            filter:
              'drop-shadow(0 0 32px rgba(100,220,200,0.45)) drop-shadow(0 0 80px rgba(100,220,200,0.2))',
          }}
        />
      </motion.div>

      {/* Epigraph */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="font-body italic text-lg md:text-xl max-w-md mb-12"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        "Você não nasceu em terra firme.<br />Nasceu no vento."
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.7 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/capitulo/introducao"
          className="px-8 py-3 font-ui font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:brightness-110"
          style={{
            background: 'var(--color-arcano)',
            color: '#04060C',
            borderRadius: 2,
            letterSpacing: '0.15em',
          }}
        >
          Ler o Livro
        </Link>
        <a
          href="#mundo"
          className="px-8 py-3 font-ui font-semibold text-sm uppercase tracking-widest border transition-all duration-200 hover:bg-white hover:bg-opacity-5"
          style={{
            borderColor: 'var(--color-arcano-dim)',
            color: 'var(--color-text-secondary)',
            borderRadius: 2,
            letterSpacing: '0.15em',
          }}
        >
          Conhecer o Mundo
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-glow-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
        >
          Role para baixo
        </span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--color-arcano-dim)' }}>
          <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ─── Main export ───────────────────────────────────────────────── */

export function HeroParallax() {
  return (
    <section className="relative overflow-hidden" style={{ height: '100vh' }}>
      {/* Layer 1: Sky + vídeo de fundo (speed 0.05) */}
      <ParallaxLayer speed={0.05} zIndex={10}>
        <SkyLayer />
      </ParallaxLayer>

      {/* Layer 2: Far clouds (speed 0.15) */}
      <ParallaxLayer speed={0.15} zIndex={20}>
        <CloudLayer />
      </ParallaxLayer>

      {/* Layer 3: Far island silhouettes (speed 0.25) */}
      <ParallaxLayer speed={0.25} zIndex={30}>
        <FarIslandsLayer />
      </ParallaxLayer>

      {/* Layer 4: Near islands (speed 0.45) */}
      <ParallaxLayer speed={0.45} zIndex={40}>
        <NearIslandsLayer />
      </ParallaxLayer>

      {/* Layer 5: Foreground ropes/deck (speed 0.7) */}
      <ParallaxLayer speed={0.7} zIndex={45}>
        <ForegroundLayer />
      </ParallaxLayer>

      {/* Hero text + logo — acima de tudo */}
      <HeroContent />

      {/* Fade para o conteúdo abaixo */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-50 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-abyss))' }}
      />
    </section>
  )
}
