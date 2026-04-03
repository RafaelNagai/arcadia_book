import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { Character } from '@/data/characterTypes'
import charactersData from '@characters'

const CHARACTERS = charactersData as Character[]

/* ─── Element colors ───────────────────────────────────────────── */
const ELEMENT_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  'Energia':   { text: '#E8803A', bg: 'rgba(200,90,32,0.18)',   glow: 'rgba(232,128,58,0.45)' },
  'Anomalia':  { text: '#6FC892', bg: 'rgba(42,155,111,0.18)',  glow: 'rgba(111,200,146,0.45)' },
  'Paradoxo':  { text: '#50C8E8', bg: 'rgba(32,143,168,0.18)',  glow: 'rgba(80,200,232,0.45)' },
  'Astral':    { text: '#C090F0', bg: 'rgba(107,63,160,0.18)',  glow: 'rgba(192,144,240,0.45)' },
  'Cognitivo': { text: '#E8B84B', bg: 'rgba(200,146,42,0.18)',  glow: 'rgba(232,184,75,0.45)' },
}
const DEFAULT_ACCENT = { text: '#C8E0F0', bg: 'rgba(32,96,160,0.18)', glow: 'rgba(200,224,240,0.3)' }

function getAccent(element: string | null | undefined) {
  return element ? (ELEMENT_COLORS[element] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT
}

/* ─── Attribute groups ─────────────────────────────────────────── */
const ATTR_GROUPS = [
  {
    attr: 'fisico' as const, label: 'Físico', color: '#C04040',
    skills: [
      { key: 'fortitude' as const,  label: 'Fortitude' },
      { key: 'vontade' as const,    label: 'Vontade' },
      { key: 'atletismo' as const,  label: 'Atletismo' },
      { key: 'combate' as const,    label: 'Combate' },
    ],
  },
  {
    attr: 'destreza' as const, label: 'Destreza', color: '#20A080',
    skills: [
      { key: 'furtividade' as const, label: 'Furtividade' },
      { key: 'precisao' as const,    label: 'Precisão' },
      { key: 'acrobacia' as const,   label: 'Acrobacia' },
      { key: 'reflexo' as const,     label: 'Reflexo' },
    ],
  },
  {
    attr: 'intelecto' as const, label: 'Intelecto', color: '#4080C0',
    skills: [
      { key: 'percepcao' as const,    label: 'Percepção' },
      { key: 'intuicao' as const,     label: 'Intuição' },
      { key: 'investigacao' as const, label: 'Investigação' },
      { key: 'conhecimento' as const, label: 'Conhecimento' },
    ],
  },
  {
    attr: 'influencia' as const, label: 'Influência', color: '#A060C0',
    skills: [
      { key: 'empatia' as const,     label: 'Empatia' },
      { key: 'dominacao' as const,   label: 'Dominação' },
      { key: 'persuasao' as const,   label: 'Persuasão' },
      { key: 'performance' as const, label: 'Performance' },
    ],
  },
]

/* ─── Honeycomb grid ───────────────────────────────────────────── */
const HEX_R = 11
const HEX_W = Math.sqrt(3) * HEX_R
const ROW_SPACING = HEX_R * 1.5

function hexPoints(cx: number, cy: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 2 - i * (Math.PI / 3)
    return `${(cx + HEX_R * Math.cos(angle)).toFixed(2)},${(cy + HEX_R * Math.sin(angle)).toFixed(2)}`
  }).join(' ')
}

function lerpHex(c1: string, c2: string, t: number): string {
  const h = (s: string, o: number) => parseInt(s.slice(o, o + 2), 16)
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t)
  return `rgb(${lerp(h(c1, 1), h(c2, 1))},${lerp(h(c1, 3), h(c2, 3))},${lerp(h(c1, 5), h(c2, 5))})`
}

function HoneycombGrid({
  total,
  colorTop,
  colorBottom,
  label,
  accentColor,
}: {
  total: number
  colorTop: string
  colorBottom: string
  label: string
  accentColor: string
}) {
  const COLS = Math.min(8, Math.max(4, Math.round(Math.sqrt(total))))
  const totalRows = Math.ceil(total / COLS)
  const svgW = (COLS + 0.5) * HEX_W + 4
  const svgH = totalRows * ROW_SPACING + HEX_R + 4

  const cells: { cx: number; cy: number; row: number; idx: number }[] = []
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / COLS)
    const col = i % COLS
    const isOddRow = row % 2 === 1
    cells.push({
      cx: col * HEX_W + (isOddRow ? HEX_W / 2 : 0) + HEX_W / 2 + 2,
      cy: row * ROW_SPACING + HEX_R + 2,
      row,
      idx: i,
    })
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: accentColor, fontFamily: 'var(--font-ui)' }}>
          {label}
        </p>
        <span className="font-display font-bold text-3xl" style={{ color: '#EEF4FC' }}>
          {total}
        </span>
      </div>
      <svg width={svgW} height={svgH} style={{ display: 'block', overflow: 'visible' }}>
        {cells.map(({ cx, cy, row, idx }) => (
          <polygon
            key={idx}
            points={hexPoints(cx, cy)}
            fill={lerpHex(colorTop, colorBottom, totalRows > 1 ? row / (totalRows - 1) : 1)}
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </div>
  )
}

/* ─── Skill pips ───────────────────────────────────────────────── */
function SkillPips({ value, hasTalent, color }: { value: number; hasTalent: boolean; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8,
          borderRadius: hasTalent && i < value ? 2 : '50%',
          background: i < value ? color : 'rgba(255,255,255,0.07)',
          border: `1px solid ${i < value ? color : 'rgba(255,255,255,0.13)'}`,
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

/* ─── Attribute block ──────────────────────────────────────────── */
function AttributeBlock({ group, character }: { group: typeof ATTR_GROUPS[number]; character: Character }) {
  return (
    <div className="rounded-sm overflow-hidden"
      style={{ background: 'rgba(4,10,20,0.7)', border: `1px solid ${group.color}33` }}>
      <div className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${group.color}1A 0%, transparent 100%)`,
          borderBottom: `1px solid ${group.color}33`,
        }}>
        <span className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: group.color, fontFamily: 'var(--font-ui)' }}>
          {group.label}
        </span>
        <span className="font-display font-bold text-2xl" style={{ color: group.color }}>
          {character.attributes[group.attr]}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {group.skills.map(skill => {
          const val = character.skills[skill.key]
          const hasTalent = character.talents.includes(skill.key)
          return (
            <div key={skill.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{
                  fontSize: '0.6rem',
                  lineHeight: 1,
                  flexShrink: 0,
                  color: hasTalent ? group.color : 'rgba(255,255,255,0.18)',
                  fontWeight: hasTalent ? 700 : 400,
                }}>
                  {hasTalent ? '◆' : '◇'}
                </span>
                <span className="text-xs" style={{
                  color: val > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: hasTalent ? 600 : 400,
                }}>
                  {skill.label}
                </span>
              </div>
              <SkillPips value={val} hasTalent={hasTalent} color={group.color} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Misc sub-components ──────────────────────────────────────── */
function EntropiaDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: 2,
          background: i < value ? '#8040A0' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${i < value ? '#B060D0' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: i < value ? '0 0 6px #B060D066' : 'none',
        }} />
      ))}
      <span className="text-xs ml-1" style={{ color: '#B060D0', fontFamily: 'var(--font-ui)' }}>
        {value > 0 ? `${value} slot${value > 1 ? 's' : ''}` : 'sem slots'}
      </span>
    </div>
  )
}

function Tag({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider"
      style={{ color, background: bg, border: `1px solid ${color}44`, fontFamily: 'var(--font-ui)' }}>
      {children}
    </span>
  )
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, flexShrink: 0 }} />
      <p className="text-xs font-semibold uppercase tracking-[0.22em]"
        style={{ color: accent, fontFamily: 'var(--font-ui)' }}>
        {children}
      </p>
    </div>
  )
}

/* ─── Main page ────────────────────────────────────────────────── */
export function CharacterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const character = CHARACTERS.find(c => c.id === id)

  const { scrollY } = useScroll()
  const heroImgY     = useTransform(scrollY, [0, 900], [0, -220])
  const heroContentY = useTransform(scrollY, [0, 600], [0, 90])
  const heroOpacity  = useTransform(scrollY, [0, 420], [1, 0])
  const backOpacity  = useTransform(scrollY, [0, 150], [1, 0.35])

  useEffect(() => {
    document.title = character ? `${character.name} — Arcádia` : 'Arcádia'
    window.scrollTo({ top: 0 })
  }, [character])

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-abyss)' }}>
        <div className="text-center space-y-4">
          <p className="font-display text-2xl" style={{ color: 'var(--color-text-secondary)' }}>
            Personagem não encontrado
          </p>
          <button onClick={() => navigate(-1)}
            style={{ color: 'var(--color-arcano-glow)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  const accent    = getAccent(character.afinidade)
  const antAccent = getAccent(character.antitese)

  return (
    <div style={{ background: 'var(--color-abyss)', minHeight: '100vh' }}>

      {/* ── Fixed back button ────────────────────────────── */}
      <motion.div
        style={{ opacity: backOpacity, position: 'fixed', top: 16, left: 16, zIndex: 50 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider"
          style={{
            background: 'rgba(4,10,20,0.75)',
            border: '1px solid rgba(255,255,255,0.13)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-ui)',
            cursor: 'pointer',
            letterSpacing: '0.12em',
          }}
        >
          ← Voltar
        </button>
      </motion.div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>

        <motion.div style={{ y: heroImgY, position: 'absolute', top: '-20%', left: 0, right: 0, bottom: '-20%' }}>
          {character.image ? (
            <img
              src={character.image}
              alt={character.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `
                radial-gradient(ellipse 55% 55% at 65% 35%, ${accent.glow} 0%, transparent 65%),
                linear-gradient(155deg, rgba(4,10,20,0.97) 0%, rgba(8,18,36,0.78) 50%, rgba(4,10,20,1) 100%)
              `,
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.05,
                backgroundImage: `
                  repeating-linear-gradient(0deg,  ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 56px),
                  repeating-linear-gradient(90deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 56px)
                `,
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '60%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'min(32rem, 58vw)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: accent.text,
                opacity: 0.04,
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                {character.name[0]}
              </div>
            </div>
          )}
        </motion.div>

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(4,10,20,0.97) 0%, rgba(4,10,20,0.4) 45%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(4,10,20,0.52) 0%, transparent 55%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, pointerEvents: 'none',
          background: `linear-gradient(90deg, ${accent.text} 0%, ${accent.text}44 50%, transparent 80%)`,
        }} />

        {/* Name + concept + quote */}
        <motion.div style={{
          y: heroContentY,
          opacity: heroOpacity,
          position: 'absolute',
          bottom: '9%', left: 0, right: 0,
          paddingLeft: 'max(2rem, env(safe-area-inset-left))',
          paddingRight: '2rem',
        }}>
          <div style={{ maxWidth: 680 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.24em] font-semibold"
                style={{ color: accent.text, fontFamily: 'var(--font-ui)' }}>
                {character.race}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
              <span className="text-xs uppercase tracking-[0.18em]"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                Nível {character.level}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(3.2rem, 9vw, 7rem)',
              lineHeight: 0.92,
              color: '#EEF4FC',
              letterSpacing: '-0.02em',
              textShadow: `0 0 80px ${accent.glow}`,
              marginBottom: '0.75rem',
            }}>
              {character.name}
            </h1>

            <p className="text-sm font-semibold mb-3"
              style={{
                color: accent.text,
                fontFamily: 'var(--font-ui)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
              {character.concept}
            </p>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'rgba(200,220,240,0.6)',
              borderLeft: `2px solid ${accent.text}55`,
              paddingLeft: '1rem',
              maxWidth: 480,
            }}>
              "{character.quote}"
            </p>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: useTransform(scrollY, [0, 180], [0.65, 0]), position: 'absolute', bottom: 24, right: 24 }}
          className="flex flex-col items-center gap-1.5">
          <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ficha
          </span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${accent.text}55, transparent)` }} />
        </motion.div>
      </div>

      {/* ── SHEET ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">

        {/* Pontos de Vida e Sanidade — colmeias */}
        <section>
          <SectionLabel accent={accent.text}>Vitalidade</SectionLabel>
          <div className="flex flex-wrap gap-12">
            <HoneycombGrid
              total={character.hp}
              colorTop="#9EDA60"
              colorBottom="#1C5C10"
              label="Pontos de Vida"
              accentColor="#6EC840"
            />
            <HoneycombGrid
              total={character.sanidade}
              colorTop="#EAA8A8"
              colorBottom="#9C1818"
              label="Sanidade"
              accentColor="#D04040"
            />
          </div>
        </section>

        {/* Atributos e Perícias */}
        <section>
          <SectionLabel accent={accent.text}>Atributos e Perícias</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ATTR_GROUPS.map(group => (
              <AttributeBlock key={group.attr} group={group} character={character} />
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
            ◆ talento · ◇ sem talento — com talento, pode rolar novamente um dado em testes desta perícia
          </p>
        </section>

        {/* Arcano */}
        <section>
          <SectionLabel accent={accent.text}>Arcano</SectionLabel>
          <div className="rounded-sm p-5 space-y-5"
            style={{ background: 'rgba(4,10,20,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                  Afinidade
                </p>
                <Tag color={accent.text} bg={accent.bg}>{character.afinidade}</Tag>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                  Antítese
                </p>
                <Tag color={antAccent.text} bg={antAccent.bg}>{character.antitese}</Tag>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.15em] mb-2"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                Entropia
              </p>
              <EntropiaDisplay value={character.entropia} />
            </div>

            {character.runas.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.15em] mb-2"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                  Runas
                </p>
                <div className="flex flex-wrap gap-2">
                  {character.runas.map(runa => (
                    <Tag key={runa} color="#B060D0" bg="rgba(128,40,160,0.15)">{runa}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Antecedentes */}
        <section>
          <SectionLabel accent={accent.text}>Antecedentes</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {character.antecedentes.map(ant => (
              <Tag key={ant} color="#80A8C8" bg="rgba(32,96,160,0.12)">{ant}</Tag>
            ))}
          </div>
        </section>

        {/* Traumas */}
        {character.traumas.length > 0 && (
          <section>
            <SectionLabel accent={accent.text}>Traumas</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {character.traumas.map(trauma => (
                <Tag key={trauma} color="#C05050" bg="rgba(160,32,32,0.15)">{trauma}</Tag>
              ))}
            </div>
          </section>
        )}

        <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
