import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Data ───────────────────────────────────────────────────────── */

interface ElementEntry {
  key: string
  name: string
  essence: string
  description: string
  color: string
  textColor: string
}

const ELEMENTS: ElementEntry[] = [
  {
    key: 'astral',
    name: 'Astral',
    essence: 'Espírito, percepção e transcendência',
    description: 'Projetar consciência, invocar entidades e acessar outros planos de existência.',
    color: 'rgba(107,63,160,0.22)',
    textColor: '#C090F0',
  },
  {
    key: 'anomalia',
    name: 'Anomalia',
    essence: 'Caos, mutação e alteração da realidade',
    description: 'Transmutação, criação de seres, dobrar corpos e moldar matéria com instinto.',
    color: 'rgba(42,155,111,0.22)',
    textColor: '#6FC892',
  },
  {
    key: 'energia',
    name: 'Energia',
    essence: 'Força bruta, criação e poder físico',
    description: 'Fogo, eletricidade, plasma e luz concentrada — manifestação pura e impossível de ignorar.',
    color: 'rgba(200,90,32,0.22)',
    textColor: '#E8803A',
  },
  {
    key: 'paradoxo',
    name: 'Paradoxo',
    essence: 'Tempo, espaço e distorção de conceitos',
    description: 'Manipular probabilidade, gravidade, trajeto e tempo — reescrever verdades aceitas.',
    color: 'rgba(32,143,168,0.22)',
    textColor: '#50C8E8',
  },
  {
    key: 'cognitivo',
    name: 'Cognitivo',
    essence: 'Mente, sentidos e domínio psíquico',
    description: 'Controlar percepção, memória e julgamento — o alvo nunca sabe o que é real.',
    color: 'rgba(200,146,42,0.22)',
    textColor: '#E8B84B',
  },
]

/** D6 result (1–5) → ElementEntry. 6 = free choice. */
const DIE_MAP: Record<number, ElementEntry | null> = {
  1: ELEMENTS[0], // Astral
  2: ELEMENTS[1], // Anomalia
  3: ELEMENTS[2], // Energia
  4: ELEMENTS[3], // Paradoxo
  5: ELEMENTS[4], // Cognitivo
  6: null,        // Livre escolha
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function d6(): number { return Math.floor(Math.random() * 6) + 1 }

/* ─── Sub-components ────────────────────────────────────────────── */

function D6Display({ value, delay }: { value: number; delay: number }) {
  const isFree = value === 6
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', damping: 13 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className="w-16 h-16 rounded flex items-center justify-center font-display font-bold text-3xl border"
        style={{
          background: isFree ? 'rgba(200,146,42,0.18)' : 'rgba(15,23,41,0.6)',
          borderColor: isFree ? 'var(--color-arcano)' : 'var(--color-border)',
          color: isFree ? 'var(--color-arcano-glow)' : 'var(--color-text-primary)',
        }}
      >
        {value}
      </div>
      <span className="text-xs font-ui" style={{ color: 'var(--color-text-muted)' }}>D6</span>
    </motion.div>
  )
}

function ElementCard({
  element,
  role,
  bonus,
  onClick,
  selectable,
}: {
  element: ElementEntry
  role?: 'afinidade' | 'antitese'
  bonus?: number
  onClick?: () => void
  selectable?: boolean
}) {
  const roleLabel = role === 'afinidade' ? 'Afinidade' : role === 'antitese' ? 'Antítese' : null
  const roleColor = role === 'afinidade' ? '#E8B84B' : '#9B6FD0'

  return (
    <motion.div
      layout
      className={`rounded border p-4 flex-1 min-w-0 ${selectable ? 'cursor-pointer transition-all duration-150' : ''}`}
      style={{
        background: element.color,
        borderColor: role ? roleColor + '88' : element.textColor + '44',
        outline: role ? `1px solid ${roleColor}44` : 'none',
      }}
      onClick={onClick}
      whileHover={selectable ? { scale: 1.01 } : {}}
      whileTap={selectable ? { scale: 0.99 } : {}}
    >
      {roleLabel && (
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-ui font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ background: roleColor + '22', color: roleColor }}
          >
            {roleLabel}
          </span>
          {bonus !== undefined && (
            <span className="text-lg font-display font-bold" style={{ color: roleColor }}>
              +{bonus}
            </span>
          )}
        </div>
      )}
      <p className="font-display font-bold text-base mb-0.5" style={{ color: element.textColor }}>
        {element.name}
      </p>
      <p className="text-xs font-ui mb-2" style={{ color: element.textColor, opacity: 0.7 }}>
        {element.essence}
      </p>
      <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {element.description}
      </p>
      {selectable && !role && (
        <p className="text-xs mt-2 font-ui text-center" style={{ color: 'var(--color-text-muted)' }}>
          Clique para definir Afinidade
        </p>
      )}
    </motion.div>
  )
}

function ElementPicker({ onPick, label }: { onPick: (el: ElementEntry) => void; label: string }) {
  return (
    <div className="rounded border p-3" style={{ background: 'rgba(200,146,42,0.06)', borderColor: 'var(--color-arcano-dim)' }}>
      <p className="text-xs font-ui mb-3 text-center" style={{ color: 'var(--color-arcano-glow)' }}>
        {label} — Livre escolha
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {ELEMENTS.map(el => (
          <button
            key={el.key}
            onClick={() => onPick(el)}
            className="px-3 py-1.5 rounded border text-xs font-ui font-semibold transition-all duration-150 hover:brightness-125"
            style={{ background: el.color, borderColor: el.textColor + '55', color: el.textColor }}
          >
            {el.name}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Widget ────────────────────────────────────────────────── */

interface RollState {
  dice: [number, number]
  chosen: [ElementEntry | null, ElementEntry | null]
  swapped: boolean
}

export function AfinidadeWidget() {
  const [roll, setRoll]     = useState<RollState | null>(null)
  const [rolling, setRolling] = useState(false)

  const doRoll = useCallback(() => {
    setRolling(true)
    setRoll(null)
    setTimeout(() => {
      const d1 = d6(), d2 = d6()
      setRoll({
        dice: [d1, d2],
        chosen: [DIE_MAP[d1], DIE_MAP[d2]],
        swapped: false,
      })
      setRolling(false)
    }, 400)
  }, [])

  const pickElement = (dieIdx: 0 | 1, el: ElementEntry) => {
    if (!roll) return
    const chosen = [...roll.chosen] as [ElementEntry | null, ElementEntry | null]
    chosen[dieIdx] = el
    setRoll({ ...roll, chosen })
  }

  const swap = () => roll && setRoll({ ...roll, swapped: !roll.swapped })

  // Determine final elements after user picks
  const el1 = roll?.chosen[0] ?? null
  const el2 = roll?.chosen[1] ?? null
  const bothReady = el1 !== null && el2 !== null

  // Which element is Afinidade (index 0 or 1 depending on swapped)
  const afinidadeEl = roll?.swapped ? el2 : el1
  const antiteseEl  = roll?.swapped ? el1 : el2

  const isDouble = bothReady && el1!.key === el2!.key

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ background: 'var(--color-deep)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <span style={{ color: 'var(--color-arcano)', fontSize: '1.1rem' }}>✦</span>
        <div>
          <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-arcano-glow)' }}>
            Gerador de Afinidade e Antítese
          </h3>
          <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--color-text-muted)' }}>
            Rola 2D6 — o jogador escolhe qual dado é Afinidade (+4) e qual é Antítese (+2)
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Roll button */}
        <button
          onClick={doRoll}
          disabled={rolling}
          className="w-full py-3 font-ui font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          style={{ background: 'var(--color-arcano)', color: '#04060C', borderRadius: 2, letterSpacing: '0.15em' }}
        >
          {rolling ? 'Rolando…' : roll ? 'Rolar Novamente' : 'Rolar 2D6'}
        </button>

        {/* Results */}
        <AnimatePresence>
          {roll && !rolling && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Dice */}
              <div className="flex gap-6 justify-center">
                <D6Display value={roll.dice[0]} delay={0} />
                <D6Display value={roll.dice[1]} delay={0.08} />
              </div>

              {/* Free choice pickers */}
              {roll.dice[0] === 6 && roll.chosen[0] === null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <ElementPicker label="Dado 1" onPick={el => pickElement(0, el)} />
                </motion.div>
              )}
              {roll.dice[1] === 6 && roll.chosen[1] === null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <ElementPicker label="Dado 2" onPick={el => pickElement(1, el)} />
                </motion.div>
              )}

              {/* Elements resolved */}
              {bothReady && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
                  {isDouble ? (
                    /* ── Double connection ── */
                    <div className="space-y-3">
                      <div
                        className="rounded border px-4 py-2 text-center"
                        style={{ background: 'rgba(200,146,42,0.08)', borderColor: 'var(--color-arcano-dim)' }}
                      >
                        <p className="text-xs font-ui uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-arcano-dim)' }}>
                          Raridade
                        </p>
                        <p className="font-display font-bold text-sm" style={{ color: 'var(--color-arcano-glow)' }}>
                          Dupla Conexão — Afinidade e Antítese no mesmo elemento
                        </p>
                      </div>
                      <ElementCard element={afinidadeEl!} role="afinidade" bonus={4} />
                      <div
                        className="rounded border px-4 py-3 flex items-center justify-between"
                        style={{ background: 'rgba(107,63,160,0.12)', borderColor: 'rgba(107,63,160,0.4)' }}
                      >
                        <span className="text-sm font-ui" style={{ color: 'var(--color-text-secondary)' }}>
                          Antítese (mesmo elemento)
                        </span>
                        <span className="font-display font-bold text-lg" style={{ color: '#9B6FD0' }}>+2</span>
                      </div>
                      <div
                        className="rounded border px-4 py-3 flex items-center justify-between"
                        style={{ background: 'rgba(15,23,41,0.6)', borderColor: 'var(--color-border)' }}
                      >
                        <span className="text-sm font-ui" style={{ color: 'var(--color-text-secondary)' }}>
                          Bônus total ao conjurar {afinidadeEl!.name}
                        </span>
                        <span className="font-display font-bold text-2xl" style={{ color: 'var(--color-arcano-glow)' }}>+6</span>
                      </div>
                      <p className="text-xs text-center font-body italic" style={{ color: 'var(--color-text-muted)' }}>
                        Carregar o mesmo elemento como Afinidade e Antítese é como ter dois rios correndo em sentidos opostos dentro do mesmo canal.
                      </p>
                    </div>
                  ) : (
                    /* ── Different elements ── */
                    <div className="space-y-3">
                      <p className="text-xs font-ui text-center" style={{ color: 'var(--color-text-muted)' }}>
                        Clique em um elemento para torná-lo sua <strong style={{ color: 'var(--color-arcano-glow)' }}>Afinidade</strong> — o outro vira Antítese
                      </p>

                      <div className="flex gap-3">
                        <ElementCard
                          element={afinidadeEl!}
                          role="afinidade"
                          bonus={4}
                          selectable={false}
                        />
                        <ElementCard
                          element={antiteseEl!}
                          role="antitese"
                          bonus={2}
                          selectable={false}
                        />
                      </div>

                      <button
                        onClick={swap}
                        className="w-full py-2 rounded border text-sm font-ui font-semibold transition-all duration-150 hover:brightness-125"
                        style={{
                          background: 'rgba(15,23,41,0.6)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        ⇄ Inverter — Afinidade ↔ Antítese
                      </button>

                      {/* Bonus summary */}
                      <div
                        className="rounded border px-4 py-3 flex items-center justify-between"
                        style={{ background: 'rgba(15,23,41,0.6)', borderColor: 'var(--color-border)' }}
                      >
                        <div className="text-sm font-ui" style={{ color: 'var(--color-text-secondary)' }}>
                          <span style={{ color: '#E8B84B' }}>{afinidadeEl!.name}</span> +4 &nbsp;·&nbsp;
                          <span style={{ color: '#9B6FD0' }}>{antiteseEl!.name}</span> +2 &nbsp;·&nbsp;
                          demais elementos +0
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
