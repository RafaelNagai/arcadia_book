import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ─────────────────────────────────────────────────────── */

type DieType = 4 | 6 | 8 | 10 | 12
type DefenseMode = 'DA' | 'DP'

interface DieResult {
  value: number
  damage: 0 | 1 | 2
  isDouble: boolean
  label: string
}

/* ─── Mechanics ─────────────────────────────────────────────────── */

function dp(da: number) {
  return Math.floor(da / 2)
}

function evalDie(value: number, threshold: number): DieResult {
  const double = threshold * 2
  if (value < threshold) return { value, damage: 0, isDouble: false, label: 'Sem dano' }
  if (value >= double)   return { value, damage: 2, isDouble: true,  label: 'Dado Duplo (+2)' }
  return { value, damage: 1, isDouble: false, label: '1 dano' }
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

/* ─── Sub-components ────────────────────────────────────────────── */

const DIE_FACES: Record<DieType, string> = { 4: 'D4', 6: 'D6', 8: 'D8', 10: 'D10', 12: 'D12' }
const DIE_TYPES: DieType[] = [4, 6, 8, 10, 12]

function DieDisplay({ result, index }: { result: DieResult; index: number }) {
  const colors = {
    0: { bg: 'rgba(139,26,26,0.25)', border: '#5A1010', text: '#E88080', labelColor: '#8B3030' },
    1: { bg: 'rgba(200,146,42,0.2)',  border: '#7A5516', text: '#E8B84B', labelColor: '#C8922A' },
    2: { bg: 'rgba(107,63,160,0.25)', border: '#4A2580', text: '#C090F0', labelColor: '#9B6FD0' },
  }
  const c = colors[result.damage]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotate: -15 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', damping: 14 }}
      className="flex flex-col items-center gap-1"
    >
      {/* Die face */}
      <div
        className="w-14 h-14 rounded flex items-center justify-center font-display font-bold text-xl border"
        style={{ background: c.bg, borderColor: c.border, color: c.text }}
      >
        {result.value}
      </div>
      {/* Damage label */}
      <span className="text-xs font-ui text-center leading-tight" style={{ color: c.labelColor }}>
        {result.label}
      </span>
      {/* Double badge */}
      {result.isDouble && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-ui font-semibold"
          style={{ background: 'rgba(107,63,160,0.3)', color: '#C090F0', fontSize: '0.65rem' }}
        >
          ×2
        </span>
      )}
    </motion.div>
  )
}

function ConfigRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="w-32 shrink-0 text-sm font-ui"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

/* ─── Main Widget ────────────────────────────────────────────────── */

export function CombatWidget() {
  const [numDice, setNumDice]       = useState(2)
  const [dieType, setDieType]       = useState<DieType>(10)
  const [da, setDa]                 = useState(4)
  const [mode, setMode]             = useState<DefenseMode>('DA')
  const [results, setResults]       = useState<DieResult[] | null>(null)
  const [rolling, setRolling]       = useState(false)

  const threshold  = mode === 'DA' ? da : dp(da)
  const doubleThreshold = threshold * 2
  const currentDp  = dp(da)

  const roll = useCallback(() => {
    setRolling(true)
    setResults(null)
    setTimeout(() => {
      const rolled = Array.from({ length: numDice }, () => rollDie(dieType))
      setResults(rolled.map(v => evalDie(v, threshold)))
      setRolling(false)
    }, 350)
  }, [numDice, dieType, threshold])

  const totalDamage = results?.reduce((s, r) => s + r.damage, 0) ?? null
  const hits        = results?.filter(r => r.damage > 0).length ?? 0
  const doubles     = results?.filter(r => r.isDouble).length ?? 0

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ background: 'var(--color-deep)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-arcano)', fontSize: '1.1rem' }}>⚔</span>
        <div>
          <h3
            className="font-display font-semibold text-base"
            style={{ color: 'var(--color-arcano-glow)' }}
          >
            Simulador de Dano
          </h3>
          <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--color-text-muted)' }}>
            Configure o ataque e role para ver o dano contra a defesa
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Config */}
        <div className="space-y-4">

          {/* Dice count */}
          <ConfigRow label="Dados de dano">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNumDice(Math.max(1, numDice - 1))}
                className="w-8 h-8 rounded border flex items-center justify-center text-lg font-bold transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                −
              </button>
              <span
                className="w-8 text-center font-display font-bold text-xl"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {numDice}
              </span>
              <button
                onClick={() => setNumDice(Math.min(6, numDice + 1))}
                className="w-8 h-8 rounded border flex items-center justify-center text-lg font-bold transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                +
              </button>
            </div>
          </ConfigRow>

          {/* Die type */}
          <ConfigRow label="Tipo de dado">
            <div className="flex gap-2 flex-wrap">
              {DIE_TYPES.map(d => (
                <button
                  key={d}
                  onClick={() => setDieType(d)}
                  className="px-3 py-1.5 text-sm font-ui font-semibold rounded border transition-all duration-150"
                  style={{
                    borderColor: dieType === d ? 'var(--color-arcano)' : 'var(--color-border)',
                    background:  dieType === d ? 'rgba(200,146,42,0.15)' : 'transparent',
                    color:       dieType === d ? 'var(--color-arcano-glow)' : 'var(--color-text-secondary)',
                  }}
                >
                  {DIE_FACES[d]}
                </button>
              ))}
            </div>
          </ConfigRow>

          {/* DA slider */}
          <ConfigRow label={`DA do alvo (${da})`}>
            <div className="flex items-center gap-3 flex-1">
              <input
                type="range"
                min={1}
                max={7}
                value={da}
                onChange={e => setDa(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <div className="text-right shrink-0">
                <span className="text-xs font-ui" style={{ color: 'var(--color-text-muted)' }}>
                  DP = {currentDp}
                </span>
              </div>
            </div>
          </ConfigRow>

          {/* Defense mode */}
          <ConfigRow label="Modo de defesa">
            <div className="flex rounded overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              {(['DA', 'DP'] as DefenseMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-4 py-1.5 text-sm font-ui font-semibold transition-all duration-150"
                  style={{
                    background: mode === m ? 'rgba(200,146,42,0.2)' : 'transparent',
                    color:      mode === m ? 'var(--color-arcano-glow)' : 'var(--color-text-muted)',
                    borderRight: m === 'DA' ? `1px solid var(--color-border)` : undefined,
                  }}
                >
                  {m}
                  {m === 'DP' && <span className="ml-1 opacity-60 text-xs">(Indefeso)</span>}
                </button>
              ))}
            </div>
          </ConfigRow>
        </div>

        {/* Thresholds info */}
        <div
          className="flex gap-4 text-sm font-ui px-4 py-3 rounded"
          style={{ background: 'rgba(15,23,41,0.6)', border: '1px solid var(--color-border)' }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Limiar de dano: </span>
            <strong style={{ color: 'var(--color-arcano-glow)' }}>≥ {threshold}</strong>
            <span style={{ color: 'var(--color-text-muted)' }}> → 1 dano</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Dado duplo: </span>
            <strong style={{ color: '#C090F0' }}>≥ {doubleThreshold}</strong>
            <span style={{ color: 'var(--color-text-muted)' }}> → 2 dano</span>
          </div>
        </div>

        {/* Roll button */}
        <button
          onClick={roll}
          disabled={rolling}
          className="w-full py-3 font-ui font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          style={{
            background: 'var(--color-arcano)',
            color: '#04060C',
            borderRadius: 2,
            letterSpacing: '0.15em',
          }}
        >
          {rolling ? 'Rolando…' : `Rolar ${numDice}${DIE_FACES[dieType]}`}
        </button>

        {/* Results */}
        <AnimatePresence>
          {results && !rolling && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Die results */}
              <div className="flex flex-wrap gap-3 justify-center">
                {results.map((r, i) => (
                  <DieDisplay key={i} result={r} index={i} />
                ))}
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: results.length * 0.08 + 0.1 }}
                className="px-5 py-4 rounded border text-center"
                style={{
                  background: totalDamage! > 0 ? 'rgba(200,146,42,0.08)' : 'rgba(15,23,41,0.6)',
                  borderColor: totalDamage! > 0 ? 'var(--color-arcano-dim)' : 'var(--color-border)',
                }}
              >
                <p
                  className="font-display font-bold text-3xl mb-1"
                  style={{ color: totalDamage! > 0 ? 'var(--color-arcano-glow)' : 'var(--color-text-muted)' }}
                >
                  {totalDamage} {totalDamage === 1 ? 'ponto' : 'pontos'} de dano
                </p>
                <p className="text-sm font-ui" style={{ color: 'var(--color-text-muted)' }}>
                  {hits} de {results.length} dados passaram a defesa
                  {doubles > 0 && ` · ${doubles} dado${doubles > 1 ? 's' : ''} duplo${doubles > 1 ? 's' : ''}`}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
