import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character, CharacterSkills, CharacterAttributes } from '@/data/characterTypes'
import { saveCustomCharacter, generateId, getCustomCharacter, calcHP, calcSanidade } from '@/lib/localCharacters'

/* ─── Constants ────────────────────────────────────────────────── */

const RACES = ['Humano', 'Humana', 'Elfo', 'Elfa', 'Elfo Noturno', 'Elfa Noturna', 'Avaro', 'Anão', 'Anã', 'Orc', 'Outro']

const ELEMENTS = ['Energia', 'Anomalia', 'Paradoxo', 'Astral', 'Cognitivo'] as const
type ElementName = typeof ELEMENTS[number]

const ELEMENT_COLORS: Record<ElementName, { text: string; bg: string; border: string }> = {
  'Energia':   { text: '#E8803A', bg: 'rgba(200,90,32,0.18)',   border: 'rgba(232,128,58,0.5)' },
  'Anomalia':  { text: '#6FC892', bg: 'rgba(42,155,111,0.18)',  border: 'rgba(111,200,146,0.5)' },
  'Paradoxo':  { text: '#50C8E8', bg: 'rgba(32,143,168,0.18)',  border: 'rgba(80,200,232,0.5)' },
  'Astral':    { text: '#C090F0', bg: 'rgba(107,63,160,0.18)',  border: 'rgba(192,144,240,0.5)' },
  'Cognitivo': { text: '#E8B84B', bg: 'rgba(200,146,42,0.18)',  border: 'rgba(232,184,75,0.5)' },
}

// D6 → element (1-5) or free choice (6)
const D6_MAP: Record<number, ElementName | null> = {
  1: 'Astral', 2: 'Anomalia', 3: 'Energia', 4: 'Paradoxo', 5: 'Cognitivo', 6: null,
}

const ATTR_GROUPS = [
  { attr: 'fisico' as const,    label: 'Físico',     color: '#C04040',
    desc: 'Força, resistência, vigor',
    skills: [
      { key: 'fortitude' as const,  label: 'Fortitude' },
      { key: 'vontade' as const,    label: 'Vontade' },
      { key: 'atletismo' as const,  label: 'Atletismo' },
      { key: 'combate' as const,    label: 'Combate' },
    ],
  },
  { attr: 'destreza' as const,  label: 'Destreza',   color: '#20A080',
    desc: 'Agilidade, reflexos, precisão',
    skills: [
      { key: 'furtividade' as const, label: 'Furtividade' },
      { key: 'precisao' as const,    label: 'Precisão' },
      { key: 'acrobacia' as const,   label: 'Acrobacia' },
      { key: 'reflexo' as const,     label: 'Reflexo' },
    ],
  },
  { attr: 'intelecto' as const, label: 'Intelecto',  color: '#4080C0',
    desc: 'Razão, percepção, conhecimento',
    skills: [
      { key: 'percepcao' as const,    label: 'Percepção' },
      { key: 'intuicao' as const,     label: 'Intuição' },
      { key: 'investigacao' as const, label: 'Investigação' },
      { key: 'conhecimento' as const, label: 'Conhecimento' },
    ],
  },
  { attr: 'influencia' as const, label: 'Influência', color: '#A060C0',
    desc: 'Carisma, presença, persuasão',
    skills: [
      { key: 'empatia' as const,     label: 'Empatia' },
      { key: 'dominacao' as const,   label: 'Dominação' },
      { key: 'persuasao' as const,   label: 'Persuasão' },
      { key: 'performance' as const, label: 'Performance' },
    ],
  },
]

const EMPTY_SKILLS: CharacterSkills = {
  fortitude: 0, vontade: 0, atletismo: 0, combate: 0,
  furtividade: 0, precisao: 0, acrobacia: 0, reflexo: 0,
  percepcao: 0, intuicao: 0, investigacao: 0, conhecimento: 0,
  empatia: 0, dominacao: 0, persuasao: 0, performance: 0,
}
const EMPTY_ATTRS: CharacterAttributes = { fisico: 0, destreza: 0, intelecto: 0, influencia: 0 }

const STEPS = [
  { id: 1, label: 'Identidade' },
  { id: 2, label: 'Atributos' },
  { id: 3, label: 'Perícias' },
  { id: 4, label: 'Arcano' },
  { id: 5, label: 'Histórico' },
]

/* ─── Trauma data (mirrors TraumaWidget) ──────────────────────── */
interface TipoEntry { min: number; max: number; name: string; rangeLabel: string; effect: string; color: string; textColor: string; isSpecial?: boolean; isAlergia?: boolean }
interface AlvoEntry { roll: number; name: string }

const TRAUMA_TIPOS: TipoEntry[] = [
  { min: 1,  max: 1,  name: 'Mestre decide',            rangeLabel: '1',     effect: 'O Mestre determina o tipo de trauma.',                                               color: 'rgba(60,60,80,0.4)',    textColor: '#8A8A9A', isSpecial: true },
  { min: 2,  max: 4,  name: 'Vício',                    rangeLabel: '2–4',   effect: 'Ação involuntária para adquirir ou se aproximar do Alvo.',                          color: 'rgba(200,146,42,0.18)', textColor: '#E8B84B' },
  { min: 5,  max: 7,  name: 'Paranoia',                 rangeLabel: '5–7',   effect: 'Pode substituir uma perícia por outra, sem aviso.',                                  color: 'rgba(42,143,168,0.18)', textColor: '#5BC8E8' },
  { min: 8,  max: 10, name: 'Fobia',                    rangeLabel: '8–10',  effect: 'Perde 1 ação na presença do Alvo.',                                                  color: 'rgba(184,48,48,0.18)',  textColor: '#E88080' },
  { min: 11, max: 13, name: 'Medo',                     rangeLabel: '11–13', effect: 'Desvantagem em perícias perante o Alvo.',                                            color: 'rgba(200,106,32,0.18)', textColor: '#E8903A' },
  { min: 14, max: 16, name: 'Alergia',                  rangeLabel: '14–16', effect: '−3 a −6 em perícias específicas. Role a tabela de Alvo de Alergia.',                color: 'rgba(74,155,111,0.18)', textColor: '#6FC892', isAlergia: true },
  { min: 17, max: 19, name: 'Arrogância / Preconceito', rangeLabel: '17–19', effect: 'Não soma bônus de Atributo nem pode usar PE contra o Alvo.',                         color: 'rgba(123,63,160,0.18)', textColor: '#B080D8' },
  { min: 20, max: 20, name: 'Jogador decide',           rangeLabel: '20',    effect: 'O jogador determina o tipo conforme a narrativa.',                                    color: 'rgba(60,60,80,0.4)',    textColor: '#8A8A9A', isSpecial: true },
]
const TRAUMA_ALVOS: AlvoEntry[] = [
  { roll: 1, name: 'Mestre decide' },      { roll: 2, name: 'Limpeza' },
  { roll: 3, name: 'Perfeição / Imperfeição' },{ roll: 4, name: 'Religião' },
  { roll: 5, name: 'Furto / Crime' },      { roll: 6, name: 'Jogos de Azar' },
  { roll: 7, name: 'Mentiras' },           { roll: 8, name: 'Luta' },
  { roll: 9, name: 'Multidão' },           { roll: 10, name: 'Lugares' },
  { roll: 11, name: 'Animal / Criatura' }, { roll: 12, name: 'Altura' },
  { roll: 13, name: 'Cor' },               { roll: 14, name: 'Magia / Arcano' },
  { roll: 15, name: 'Montaria' },          { roll: 16, name: 'Conhecimento' },
  { roll: 17, name: 'Deficiência' },       { roll: 18, name: 'Raça' },
  { roll: 19, name: 'Equipamento / Item' },{ roll: 20, name: 'Jogador decide' },
]
const TRAUMA_ALVOS_ALERGIA: AlvoEntry[] = [
  { roll: 1, name: 'Mestre decide' },      { roll: 2, name: 'Material' },
  { roll: 3, name: 'Bebida' },             { roll: 4, name: 'Criatura (pelo, dente…)' },
  { roll: 5, name: 'Vegetal' },            { roll: 6, name: 'Carne' },
  { roll: 7, name: 'Fruta' },              { roll: 8, name: 'Arcano' },
  { roll: 9, name: 'Mofo' },              { roll: 10, name: 'Tecido' },
  { roll: 11, name: 'Poluição / Poeira' },{ roll: 12, name: 'Radiação' },
  { roll: 13, name: 'Exercício Físico' }, { roll: 14, name: 'Inseto' },
  { roll: 15, name: 'Planta' },           { roll: 16, name: 'Gás' },
  { roll: 17, name: 'Luz' },              { roll: 18, name: 'Grão' },
  { roll: 19, name: 'Medicamento / Poção' },{ roll: 20, name: 'Jogador decide' },
]

function getTipo(roll: number): TipoEntry { return TRAUMA_TIPOS.find(t => roll >= t.min && roll <= t.max)! }
function getAlvo(roll: number, table: AlvoEntry[]): AlvoEntry { return table.find(a => a.roll === roll)! }
function traumaNarrativeName(tipo: TipoEntry, alvoName: string): string {
  if (tipo.isSpecial) return `${tipo.name} (alvo: ${alvoName})`
  const prep: Record<string, string> = { 'Vício': 'em', 'Paranoia': 'de', 'Fobia': 'de', 'Medo': 'de', 'Alergia': 'a', 'Arrogância / Preconceito': 'contra' }
  return `${tipo.name} ${prep[tipo.name] ?? 'de'} ${alvoName}`
}

function d6(): number { return Math.floor(Math.random() * 6) + 1 }
function d20(): number { return Math.floor(Math.random() * 20) + 1 }

/* ─── Shared UI components ─────────────────────────────────────── */

function StepHeader({ current, onBack }: { current: number; onBack: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(4,10,20,0.93)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            ← {current === 1 ? 'Sair' : 'Voltar'}
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {current} / {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map(s => (
            <div key={s.id} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s.id <= current ? 'var(--color-arcano)' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <p style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-arcano-dim)' }}>
          {STEPS[current - 1].label}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>{hint}</p>}
    </div>
  )
}

const baseInputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4, outline: 'none',
  color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.9rem',
  transition: 'border-color 0.15s',
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={baseInputStyle}
      onFocus={e => { e.target.style.borderColor = 'var(--color-arcano)' }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
    />
  )
}

// Stepper with inline editable number — no hard upper limit
function Stepper({ value, min = 0, onChange, color = 'var(--color-arcano)' }: {
  value: number; min?: number; onChange: (v: number) => void; color?: string
}) {
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 28, height: 32, borderRadius: 4,
    border: `1px solid rgba(255,255,255,0.12)`,
    background: 'rgba(255,255,255,0.04)',
    color: disabled ? 'rgba(255,255,255,0.18)' : '#EEF4FC',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-ui)', fontSize: '1rem', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  })
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={btnStyle(value <= min)}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= min) onChange(v) }}
        style={{
          width: 48, height: 32, textAlign: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4, outline: 'none', color,
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
          // Hide arrows in most browsers
          MozAppearance: 'textfield',
        } as React.CSSProperties}
        onFocus={e => { e.target.style.borderColor = color }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
      />
      <button onClick={() => onChange(value + 1)} style={btnStyle(false)}>+</button>
    </div>
  )
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput('')
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder} style={{ ...baseInputStyle, flex: 1 }}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-arcano)' }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
        <button onClick={add} style={{
          padding: '0.6rem 0.75rem', borderRadius: 4,
          background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.3)',
          color: 'var(--color-arcano-glow)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          Adicionar
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-ui)' }}>
              {tag}
              <button onClick={() => onChange(tags.filter(t => t !== tag))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', lineHeight: 1 }}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-sm"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33` }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{label}</span>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '1rem' }}>
      {label}
    </p>
  )
}

/* ─── Step 1: Identidade ───────────────────────────────────────── */
function Step1({ data, onChange }: {
  data: { name: string; race: string; concept: string; quote: string }
  onChange: (k: string, v: string) => void
}) {
  const isExistingCustom = !RACES.slice(0, -1).includes(data.race) && data.race !== ''
  const [customRace, setCustomRace] = useState(isExistingCustom ? data.race : '')
  const [outroActive, setOutroActive] = useState(isExistingCustom)
  return (
    <div className="space-y-5">
      <Field label="Nome do Personagem">
        <TextInput value={data.name} onChange={v => onChange('name', v)} placeholder="Ex: Kalista" />
      </Field>
      <Field label="Raça">
        <div className="flex flex-wrap gap-2 mb-2">
          {RACES.map(r => {
            const active = r === 'Outro' ? outroActive : (!outroActive && data.race === r)
            return (
              <button key={r} onClick={() => {
                if (r === 'Outro') {
                  setOutroActive(true)
                  onChange('race', customRace)
                } else {
                  setOutroActive(false)
                  onChange('race', r)
                }
              }}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? 'rgba(200,146,42,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(200,146,42,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: active ? 'var(--color-arcano-glow)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.08em',
                }}>
                {r}
              </button>
            )
          })}
        </div>
        {outroActive && (
          <TextInput value={customRace} onChange={v => { setCustomRace(v); onChange('race', v) }} placeholder="Escreva a raça…" />
        )}
      </Field>
      <Field label="Conceito" hint="Uma linha que define o personagem. Ex: Capitã de Corveta · Lâmina da Tempestade">
        <TextInput value={data.concept} onChange={v => onChange('concept', v)} placeholder="Conceito · Estilo de vida" />
      </Field>
      <Field label="Frase Marcante" hint="Uma citação curta que define o espírito do personagem">
        <TextInput value={data.quote} onChange={v => onChange('quote', v)} placeholder="Ex: Eu não fujo das tempestades. Eu as dirijo." />
      </Field>
    </div>
  )
}

/* ─── Step 2: Atributos ────────────────────────────────────────── */
function Step2({ attrs, onChange }: {
  attrs: CharacterAttributes
  onChange: (k: keyof CharacterAttributes, v: number) => void
}) {
  const hp = calcHP(attrs.fisico)
  const san = calcSanidade(attrs.intelecto, attrs.influencia)
  return (
    <div className="space-y-6">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
        Distribua valores em cada Atributo. Sem limite — o Mestre e a narrativa definem o ponto de partida adequado.
      </p>
      <div className="space-y-4">
        {ATTR_GROUPS.map(g => (
          <div key={g.attr} className="flex items-center justify-between gap-4">
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 600, color: g.color }}>{g.label}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{g.desc}</p>
            </div>
            <Stepper value={attrs[g.attr]} min={0} onChange={v => onChange(g.attr, v)} color={g.color} />
          </div>
        ))}
      </div>
      <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          Derivados
        </p>
        <div className="flex gap-3">
          <StatPill label="Pontos de Vida" value={hp} color="#6EC840" />
          <StatPill label="Sanidade" value={san} color="#D04040" />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 3: Perícias ─────────────────────────────────────────── */
function Step3({ skills, talents, totalLevel, onChange, onTalentToggle }: {
  skills: CharacterSkills
  talents: string[]
  totalLevel: number
  onChange: (k: keyof CharacterSkills, v: number) => void
  onTalentToggle: (k: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', flex: 1 }}>
          Defina o valor de cada perícia. Clique no diamante para marcar como <strong style={{ color: 'var(--color-arcano-glow)' }}>Talento</strong> — sem limite.
        </p>
        <div className="flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-sm"
          style={{ background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.3)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-arcano-glow)', lineHeight: 1 }}>{totalLevel}</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-arcano-dim)' }}>Nível</span>
        </div>
      </div>
      <div className="space-y-5">
        {ATTR_GROUPS.map(g => (
          <div key={g.attr}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: g.color, marginBottom: '0.6rem', borderBottom: `1px solid ${g.color}22`, paddingBottom: '0.4rem' }}>
              {g.label}
            </p>
            <div className="space-y-2">
              {g.skills.map(skill => {
                const hasTalent = talents.includes(skill.key)
                return (
                  <div key={skill.key} className="flex items-center gap-3">
                    <button onClick={() => onTalentToggle(skill.key)}
                      title={hasTalent ? 'Remover talento' : 'Marcar como talento'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1, padding: 0, flexShrink: 0, color: hasTalent ? g.color : 'rgba(255,255,255,0.2)', transition: 'color 0.15s' }}>
                      {hasTalent ? '◆' : '◇'}
                    </button>
                    <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: hasTalent ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', fontWeight: hasTalent ? 600 : 400 }}>
                      {skill.label}
                    </span>
                    <Stepper value={skills[skill.key]} min={0} onChange={v => onChange(skill.key, v)} color={g.color} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Step 4: Arcano ───────────────────────────────────────────── */
interface DiceRollState {
  dice: [number, number]
  picks: [ElementName | null, ElementName | null]
  swapped: boolean
}

function Step4({ afinidade, antitese, entropia, runas, onChange }: {
  afinidade: string; antitese: string; entropia: number; runas: string[]
  onChange: (k: string, v: string | number | string[]) => void
}) {
  const [diceRoll, setDiceRoll] = useState<DiceRollState | null>(null)
  const [rolling, setRolling] = useState(false)

  const doRoll = useCallback(() => {
    setRolling(true); setDiceRoll(null)
    setTimeout(() => {
      const d1 = d6(), d2 = d6()
      const p1 = D6_MAP[d1]
      const p2 = D6_MAP[d2]
      const state: DiceRollState = { dice: [d1, d2], picks: [p1, p2], swapped: false }
      setDiceRoll(state)
      setRolling(false)
      if (p1 && p2) { onChange('afinidade', p1); onChange('antitese', p2) }
      else if (p1 && !p2) { onChange('afinidade', p1) }
      else if (!p1 && p2) { onChange('afinidade', p2) }
    }, 350)
  }, [onChange])

  function applyDiceResult(state: DiceRollState) {
    const el0 = state.picks[0], el1 = state.picks[1]
    if (!el0 || !el1) return
    const af = state.swapped ? el1 : el0
    const an = state.swapped ? el0 : el1
    onChange('afinidade', af); onChange('antitese', an)
  }

  function handleFreePick(idx: 0 | 1, el: ElementName) {
    if (!diceRoll) return
    const next: DiceRollState = { ...diceRoll, picks: [...diceRoll.picks] as [ElementName | null, ElementName | null] }
    next.picks[idx] = el
    setDiceRoll(next)
    if (next.picks[0] && next.picks[1]) applyDiceResult(next)
    else if (idx === 0 && next.picks[0]) onChange('afinidade', next.picks[0])
    else if (idx === 1 && next.picks[1]) onChange('antitese', next.picks[1])
  }

  function handleSwap() {
    if (!diceRoll || !diceRoll.picks[0] || !diceRoll.picks[1]) return
    const next = { ...diceRoll, swapped: !diceRoll.swapped }
    setDiceRoll(next); applyDiceResult(next)
  }

  const resolvedEl0 = diceRoll ? (diceRoll.swapped ? diceRoll.picks[1] : diceRoll.picks[0]) : null
  const resolvedEl1 = diceRoll ? (diceRoll.swapped ? diceRoll.picks[0] : diceRoll.picks[1]) : null
  const diceReady = resolvedEl0 && resolvedEl1

  return (
    <div className="space-y-6">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
        O Arcano define a relação do personagem com as forças elementais. Role os dados ou escolha manualmente.
      </p>

      {/* ── 2D6 roller ───────────────────────────── */}
      <div className="rounded-sm p-4 space-y-4"
        style={{ background: 'rgba(200,146,42,0.06)', border: '1px solid rgba(200,146,42,0.2)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-arcano-dim)' }}>
          ✦ Gerador — Rolar 2D6
        </p>
        <button onClick={doRoll} disabled={rolling}
          style={{
            width: '100%', padding: '0.6rem', borderRadius: 4,
            background: rolling ? 'rgba(200,146,42,0.1)' : 'var(--color-arcano)',
            border: 'none', cursor: rolling ? 'not-allowed' : 'pointer',
            color: '#0A0A0A', fontFamily: 'var(--font-ui)', fontWeight: 700,
            fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}>
          {rolling ? 'Rolando…' : diceRoll ? 'Rolar Novamente' : 'Rolar 2D6'}
        </button>

        <AnimatePresence>
          {diceRoll && !rolling && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Dice display */}
              <div className="flex gap-3 justify-center">
                {([0, 1] as const).map(i => {
                  const die = diceRoll.dice[i]
                  const isFree = die === 6
                  const el = diceRoll.picks[i]
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div style={{
                        width: 52, height: 52, borderRadius: 8,
                        background: isFree ? 'rgba(200,146,42,0.18)' : 'rgba(15,23,41,0.7)',
                        border: `1px solid ${isFree ? 'var(--color-arcano)' : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem',
                        color: isFree ? 'var(--color-arcano-glow)' : '#EEF4FC',
                      }}>{die}</div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: el ? (ELEMENT_COLORS[el]?.text ?? 'var(--color-text-muted)') : 'var(--color-arcano-dim)' }}>
                        {isFree ? 'livre' : (el ?? '?')}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Free choice pickers */}
              {diceRoll.dice[0] === 6 && !diceRoll.picks[0] && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--color-arcano-glow)', textAlign: 'center' }}>Dado 1 — Livre escolha</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {ELEMENTS.map(el => {
                      const ac = ELEMENT_COLORS[el]
                      return <button key={el} onClick={() => handleFreePick(0, el)} style={{ padding: '0.3rem 0.7rem', borderRadius: 4, background: ac.bg, border: `1px solid ${ac.border}`, color: ac.text, fontFamily: 'var(--font-ui)', fontSize: '0.7rem', cursor: 'pointer' }}>{el}</button>
                    })}
                  </div>
                </div>
              )}
              {diceRoll.dice[1] === 6 && !diceRoll.picks[1] && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--color-arcano-glow)', textAlign: 'center' }}>Dado 2 — Livre escolha</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {ELEMENTS.map(el => {
                      const ac = ELEMENT_COLORS[el]
                      return <button key={el} onClick={() => handleFreePick(1, el)} style={{ padding: '0.3rem 0.7rem', borderRadius: 4, background: ac.bg, border: `1px solid ${ac.border}`, color: ac.text, fontFamily: 'var(--font-ui)', fontSize: '0.7rem', cursor: 'pointer' }}>{el}</button>
                    })}
                  </div>
                </div>
              )}

              {/* Result + swap */}
              {diceReady && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {[
                      { label: 'Afinidade +4', el: resolvedEl0! },
                      { label: 'Antítese +2',  el: resolvedEl1! },
                    ].map(({ label, el }) => {
                      const ac = ELEMENT_COLORS[el]
                      return (
                        <div key={label} className="flex-1 rounded-sm px-3 py-2" style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
                          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: ac.text, opacity: 0.75 }}>{label}</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: ac.text }}>{el}</p>
                        </div>
                      )
                    })}
                  </div>
                  {resolvedEl0 !== resolvedEl1 && (
                    <button onClick={handleSwap}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', cursor: 'pointer' }}>
                      ⇄ Inverter — Afinidade ↔ Antítese
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Manual override ───────────────────────── */}
      <SectionDivider label="Ou escolha manualmente" />

      <Field label="Afinidade" hint="+4 em testes arcanos com este elemento">
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map(el => {
            const ac = ELEMENT_COLORS[el]; const active = afinidade === el
            return (
              <button key={el} onClick={() => onChange('afinidade', el)}
                style={{ padding: '0.4rem 0.9rem', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', background: active ? ac.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? ac.border : 'rgba(255,255,255,0.1)'}`, color: active ? ac.text : 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {el}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Antítese" hint="+2 em testes arcanos com este elemento. Pode ser o mesmo que a Afinidade.">
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map(el => {
            const ac = ELEMENT_COLORS[el]; const active = antitese === el
            return (
              <button key={el} onClick={() => onChange('antitese', el)}
                style={{ padding: '0.4rem 0.9rem', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', background: active ? ac.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? ac.border : 'rgba(255,255,255,0.1)'}`, color: active ? ac.text : 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {el}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Entropia" hint="Cada nível concede 1 slot de Runa">
        <Stepper value={entropia} min={0} onChange={v => onChange('entropia', v)} color="#B060D0" />
      </Field>

      <Field label="Runas" hint="Pressione Enter ou clique em Adicionar">
        <TagInput tags={runas} onChange={v => onChange('runas', v)} placeholder="Ex: Ígnea, Véu, Impulso…" />
      </Field>
    </div>
  )
}

/* ─── Step 5: Histórico ────────────────────────────────────────── */
interface TraumaRoll { roll1: number; roll2: number; alergiaRoll: number; swapped: boolean }

function Step5({ antecedentes, traumas, onChange }: {
  antecedentes: string[]; traumas: string[]
  onChange: (k: string, v: string[]) => void
}) {
  const [traumaState, setTraumaState] = useState<TraumaRoll | null>(null)
  const [traumaRolling, setTraumaRolling] = useState(false)

  const generateTrauma = useCallback(() => {
    setTraumaRolling(true); setTraumaState(null)
    setTimeout(() => {
      setTraumaState({ roll1: d20(), roll2: d20(), alergiaRoll: d20(), swapped: false })
      setTraumaRolling(false)
    }, 350)
  }, [])

  const swapTrauma = () => setTraumaState(s => s ? { ...s, swapped: !s.swapped } : s)

  const tipoRoll   = traumaState ? (traumaState.swapped ? traumaState.roll2 : traumaState.roll1) : null
  const alvoRoll   = traumaState ? (traumaState.swapped ? traumaState.roll1 : traumaState.roll2) : null
  const tipo       = tipoRoll !== null ? getTipo(tipoRoll) : null
  const isAlergia  = tipo?.isAlergia ?? false
  const alvo       = alvoRoll !== null ? getAlvo(alvoRoll, TRAUMA_ALVOS) : null
  const alvoAlergia = isAlergia && traumaState ? getAlvo(traumaState.alergiaRoll, TRAUMA_ALVOS_ALERGIA) : null
  const alvoFinal  = alvoAlergia ?? alvo
  const narrative  = tipo && alvoFinal ? traumaNarrativeName(tipo, alvoFinal.name) : ''

  function addTrauma() {
    if (!narrative || traumas.includes(narrative)) return
    onChange('traumas', [...traumas, narrative])
  }

  return (
    <div className="space-y-6">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
        O histórico define quem o personagem foi antes de aventurar-se — e as marcas que carrega.
      </p>

      <Field label="Antecedentes" hint="Profissões, origens e vínculos. Ex: Pirata, Ferreiro, Nobre Caído">
        <TagInput tags={antecedentes} onChange={v => onChange('antecedentes', v)} placeholder="Ex: Pirata, Marinheira…" />
      </Field>

      {/* ── Trauma generator ──────────────────────── */}
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>
          Traumas
        </p>

        <div className="rounded-sm p-4 space-y-3 mb-3"
          style={{ background: 'rgba(139,26,80,0.08)', border: '1px solid rgba(139,26,80,0.25)' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C04070' }}>
            ☽ Gerador de Trauma — 2D20
          </p>
          <button onClick={generateTrauma} disabled={traumaRolling}
            style={{
              width: '100%', padding: '0.6rem', borderRadius: 4,
              background: traumaRolling ? 'rgba(139,26,80,0.1)' : 'rgba(139,26,80,0.25)',
              border: '1px solid rgba(139,26,80,0.4)',
              cursor: traumaRolling ? 'not-allowed' : 'pointer',
              color: '#E06090', fontFamily: 'var(--font-ui)', fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
            {traumaRolling ? 'Rolando…' : traumaState ? 'Gerar Novo Trauma' : 'Gerar Trauma'}
          </button>

          <AnimatePresence>
            {traumaState && !traumaRolling && tipo && alvo && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Dice */}
                <div className="flex gap-3 justify-center">
                  {[
                    { val: traumaState.swapped ? traumaState.roll2 : traumaState.roll1, lbl: 'Tipo (D20)' },
                    { val: traumaState.swapped ? traumaState.roll1 : traumaState.roll2, lbl: isAlergia ? 'Alvo Geral' : 'Alvo (D20)' },
                    ...(isAlergia ? [{ val: traumaState.alergiaRoll, lbl: 'Alvo Alergia' }] : []),
                  ].map(({ val, lbl }) => (
                    <div key={lbl} className="flex flex-col items-center gap-0.5">
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--color-arcano-glow)' }}>{val}</div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{lbl}</span>
                    </div>
                  ))}
                </div>

                <button onClick={swapTrauma}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', cursor: 'pointer' }}>
                  ⇄ Trocar — usar {traumaState.swapped ? traumaState.roll1 : traumaState.roll2} como Tipo
                </button>

                {/* Cards */}
                <div className="rounded-sm px-3 py-2" style={{ background: tipo.color, border: `1px solid ${tipo.textColor}44` }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: tipo.textColor, opacity: 0.7 }}>Tipo · {tipo.rangeLabel}</span>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: tipo.textColor }}>{tipo.name}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{tipo.effect}</p>
                </div>
                <div className="rounded-sm px-3 py-2" style={{ background: 'rgba(26,36,64,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>{isAlergia ? 'Alvo da Alergia' : 'Alvo'}</span>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: '#EEF4FC' }}>{alvoFinal?.name}</p>
                </div>

                {narrative && (
                  <div className="rounded-sm px-3 py-2.5 flex items-center justify-between gap-3"
                    style={{ background: 'rgba(139,26,80,0.15)', border: '1px solid #8B1A50' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#EEF4FC' }}>{narrative}</p>
                    <button onClick={addTrauma}
                      style={{ flexShrink: 0, padding: '0.35rem 0.75rem', borderRadius: 4, background: 'rgba(200,50,80,0.3)', border: '1px solid rgba(200,50,80,0.5)', color: '#E080A0', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      + Adicionar
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual trauma entry + list */}
        <TagInput tags={traumas} onChange={v => onChange('traumas', v)} placeholder="Ou escreva um trauma manualmente…" />
      </div>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────────────── */
export function CharacterCreatorPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()

  // Pre-fill from existing character when editing
  const existing = editId ? getCustomCharacter(editId) : undefined
  const isEditing = !!existing

  const initialStep = Math.min(5, Math.max(1, Number(searchParams.get('step')) || 1))
  const isSectionEdit = isEditing && searchParams.has('step')
  const [step, setStep] = useState(initialStep)
  const [direction, setDirection] = useState(1)

  const [name, setName]       = useState(existing?.name ?? '')
  const [race, setRace]       = useState(existing?.race ?? '')
  const [concept, setConcept] = useState(existing?.concept ?? '')
  const [quote, setQuote]     = useState(existing?.quote ?? '')
  const [attrs, setAttrs]     = useState<CharacterAttributes>(existing?.attributes ?? EMPTY_ATTRS)
  const [skills, setSkills]   = useState<CharacterSkills>(existing?.skills ?? EMPTY_SKILLS)
  const [talents, setTalents] = useState<string[]>(existing?.talents ?? [])
  const [afinidade, setAfinidade]   = useState(existing?.afinidade ?? '')
  const [antitese, setAntitese]     = useState(existing?.antitese ?? '')
  const [entropia, setEntropia]     = useState(existing?.entropia ?? 0)
  const [runas, setRunas]           = useState<string[]>(existing?.runas ?? [])
  const [antecedentes, setAntecedentes] = useState<string[]>(existing?.antecedentes ?? [])
  const [traumas, setTraumas]       = useState<string[]>(existing?.traumas ?? [])

  const totalLevel = Object.values(skills).reduce((a, b) => a + b, 0)

  useEffect(() => {
    document.title = isEditing ? 'Editar Personagem — Arcádia' : 'Criar Personagem — Arcádia'
    window.scrollTo({ top: 0 })
  }, [isEditing])

  function goNext() { setDirection(1); setStep(s => s + 1); window.scrollTo({ top: 0 }) }
  function goBack() {
    if (isSectionEdit) { navigate(`/ficha/${editId}`); return }
    if (step === 1) { navigate(-1); return }
    setDirection(-1); setStep(s => s - 1); window.scrollTo({ top: 0 })
  }

  function handleSkillChange(k: keyof CharacterSkills, v: number) { setSkills(prev => ({ ...prev, [k]: v })) }
  function handleTalentToggle(k: string) { setTalents(prev => prev.includes(k) ? prev.filter(t => t !== k) : [...prev, k]) }

  const handleArcanoChange = useCallback((k: string, v: string | number | string[]) => {
    if (k === 'afinidade') setAfinidade(v as string)
    else if (k === 'antitese') setAntitese(v as string)
    else if (k === 'entropia') setEntropia(v as number)
    else if (k === 'runas') setRunas(v as string[])
  }, [])

  function handleSave() {
    const newHp = calcHP(attrs.fisico)
    const newSan = calcSanidade(attrs.intelecto, attrs.influencia)
    const character: Character = {
      // Preserve id when editing so localStorage entry is updated in-place
      id: isEditing ? existing!.id : generateId(),
      name: name.trim() || 'Sem Nome',
      race: race.trim() || 'Desconhecida',
      concept: concept.trim(),
      quote: quote.trim(),
      image: existing?.image ?? null,
      level: totalLevel,
      attributes: attrs,
      skills,
      talents,
      hp: newHp,
      sanidade: newSan,
      // Reset current values if max changed; keep if unchanged
      currentHp: existing ? Math.min(existing.currentHp ?? existing.hp, newHp) : undefined,
      currentSanidade: existing ? Math.min(existing.currentSanidade ?? existing.sanidade, newSan) : undefined,
      owned: true,
      afinidade: afinidade || 'Energia',
      antitese: antitese || 'Anomalia',
      entropia,
      runas,
      traumas,
      antecedentes,
    }
    saveCustomCharacter(character)
    navigate(`/ficha/${character.id}`)
  }

  function canProceed(): boolean {
    if (step === 1) return name.trim().length > 0 && race.trim().length > 0
    if (step === 4) return afinidade !== '' && antitese !== ''
    return true
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0 }),
  }

  return (
    <div style={{ background: 'var(--color-abyss)', minHeight: '100vh' }}>
      <StepHeader current={step} onBack={goBack} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '5.5rem 1.5rem 8rem' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeInOut' }}>
            {step === 1 && (
              <Step1
                data={{ name, race, concept, quote }}
                onChange={(k, v) => {
                  if (k === 'name') setName(v)
                  else if (k === 'race') setRace(v)
                  else if (k === 'concept') setConcept(v)
                  else if (k === 'quote') setQuote(v)
                }}
              />
            )}
            {step === 2 && (
              <Step2 attrs={attrs} onChange={(k, v) => setAttrs(prev => ({ ...prev, [k]: v }))} />
            )}
            {step === 3 && (
              <Step3 skills={skills} talents={talents} totalLevel={totalLevel} onChange={handleSkillChange} onTalentToggle={handleTalentToggle} />
            )}
            {step === 4 && (
              <Step4 afinidade={afinidade} antitese={antitese} entropia={entropia} runas={runas} onChange={handleArcanoChange} />
            )}
            {step === 5 && (
              <Step5
                antecedentes={antecedentes} traumas={traumas}
                onChange={(k, v) => {
                  if (k === 'antecedentes') setAntecedentes(v)
                  else if (k === 'traumas') setTraumas(v)
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(4,10,20,0.93)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        padding: '0.875rem 1.5rem',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {isSectionEdit ? (
            <div className="flex gap-3">
              <button onClick={goBack}
                style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!canProceed()}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 4, border: 'none', background: canProceed() ? 'var(--color-arcano)' : 'rgba(255,255,255,0.05)', cursor: canProceed() ? 'pointer' : 'not-allowed', color: canProceed() ? '#0A0A0A' : 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Salvar
              </button>
            </div>
          ) : step < STEPS.length ? (
            <button onClick={goNext} disabled={!canProceed()}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 4, border: 'none',
                background: canProceed() ? 'var(--color-arcano)' : 'rgba(255,255,255,0.05)',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                color: canProceed() ? '#0A0A0A' : 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
              {step === 1 && !canProceed() ? 'Preencha nome e raça para continuar' : 'Continuar'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { setDirection(-1); setStep(4) }}
                style={{ flex: '0 0 auto', padding: '0.75rem 1rem', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
                ← Revisar
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 4, border: 'none', background: 'var(--color-arcano)', cursor: 'pointer', color: '#0A0A0A', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Finalizar e ver ficha
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
