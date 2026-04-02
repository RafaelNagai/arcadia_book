import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Data ───────────────────────────────────────────────────────── */

interface TipoEntry {
  min: number; max: number
  name: string; rangeLabel: string
  effect: string
  color: string; textColor: string
  isSpecial?: boolean
  isAlergia?: boolean
}

const TIPOS: TipoEntry[] = [
  { min: 1,  max: 1,  name: 'Mestre decide',            rangeLabel: '1',     effect: 'O Mestre determina o tipo de trauma conforme a situação narrativa.',                                                color: 'rgba(60,60,80,0.4)',    textColor: '#8A8A9A', isSpecial: true },
  { min: 2,  max: 4,  name: 'Vício',                    rangeLabel: '2–4',   effect: 'O personagem pode realizar uma ação involuntária para adquirir ou se aproximar do Alvo do trauma.',                color: 'rgba(200,146,42,0.18)', textColor: '#E8B84B' },
  { min: 5,  max: 7,  name: 'Paranoia',                 rangeLabel: '5–7',   effect: 'O personagem pode ser forçado a substituir uma perícia escolhida pelo jogador por outra, sem aviso.',              color: 'rgba(42,143,168,0.18)', textColor: '#5BC8E8' },
  { min: 8,  max: 10, name: 'Fobia',                    rangeLabel: '8–10',  effect: 'O personagem perde 1 ação sempre que estiver na presença do Alvo do trauma.',                                      color: 'rgba(184,48,48,0.18)',  textColor: '#E88080' },
  { min: 11, max: 13, name: 'Medo',                     rangeLabel: '11–13', effect: 'O personagem tem Desvantagem em perícias quando age perante o Alvo do trauma.',                                    color: 'rgba(200,106,32,0.18)', textColor: '#E8903A' },
  { min: 14, max: 16, name: 'Alergia',                  rangeLabel: '14–16', effect: 'O problema se externaliza no corpo: −3 a −6 em perícias específicas. Role a tabela de Alvo de Alergia.',          color: 'rgba(74,155,111,0.18)', textColor: '#6FC892', isAlergia: true },
  { min: 17, max: 19, name: 'Arrogância / Preconceito', rangeLabel: '17–19', effect: 'O personagem não soma bônus de Atributo nem pode usar PE em ações contra o Alvo do trauma.',                      color: 'rgba(123,63,160,0.18)', textColor: '#B080D8' },
  { min: 20, max: 20, name: 'Jogador decide',           rangeLabel: '20',    effect: 'O jogador determina o tipo de trauma conforme o que faz sentido narrativamente para o personagem.',                color: 'rgba(60,60,80,0.4)',    textColor: '#8A8A9A', isSpecial: true },
]

interface AlvoEntry { roll: number; name: string }

const ALVOS_GERAIS: AlvoEntry[] = [
  { roll: 1,  name: 'Mestre decide' },         { roll: 2,  name: 'Limpeza' },
  { roll: 3,  name: 'Perfeição / Imperfeição' },{ roll: 4,  name: 'Religião' },
  { roll: 5,  name: 'Furto / Crime' },          { roll: 6,  name: 'Jogos de Azar / Aposta' },
  { roll: 7,  name: 'Mentiras' },               { roll: 8,  name: 'Luta' },
  { roll: 9,  name: 'Multidão' },               { roll: 10, name: 'Lugares' },
  { roll: 11, name: 'Animal / Criatura' },      { roll: 12, name: 'Altura' },
  { roll: 13, name: 'Cor' },                    { roll: 14, name: 'Magia / Arcano' },
  { roll: 15, name: 'Montaria / Transporte' },  { roll: 16, name: 'Conhecimento' },
  { roll: 17, name: 'Deficiência' },            { roll: 18, name: 'Raça' },
  { roll: 19, name: 'Equipamento / Item' },     { roll: 20, name: 'Jogador decide' },
]

const ALVOS_ALERGIA: AlvoEntry[] = [
  { roll: 1,  name: 'Mestre decide' },          { roll: 2,  name: 'Material' },
  { roll: 3,  name: 'Bebida' },                 { roll: 4,  name: 'Criatura (pelo, dente, etc.)' },
  { roll: 5,  name: 'Alimentação Vegetal' },    { roll: 6,  name: 'Alimentação — Carne' },
  { roll: 7,  name: 'Alimentação — Fruta' },    { roll: 8,  name: 'Arcano' },
  { roll: 9,  name: 'Mofo' },                   { roll: 10, name: 'Tecido' },
  { roll: 11, name: 'Poluição / Poeira' },      { roll: 12, name: 'Radiação' },
  { roll: 13, name: 'Exercício Físico' },        { roll: 14, name: 'Inseto' },
  { roll: 15, name: 'Planta' },                 { roll: 16, name: 'Gás' },
  { roll: 17, name: 'Luz' },                    { roll: 18, name: 'Grão' },
  { roll: 19, name: 'Medicamento / Poção' },    { roll: 20, name: 'Jogador decide' },
]

/* ─── Helpers ────────────────────────────────────────────────────── */

function d20(): number { return Math.floor(Math.random() * 20) + 1 }

function getTipo(roll: number): TipoEntry {
  return TIPOS.find(t => roll >= t.min && roll <= t.max)!
}
function getAlvo(roll: number, table: AlvoEntry[]): AlvoEntry {
  return table.find(a => a.roll === roll)!
}

function narrativeName(tipo: TipoEntry, alvoName: string): string {
  if (tipo.isSpecial) return ''
  const prep: Record<string, string> = {
    'Vício': 'em', 'Paranoia': 'de', 'Fobia': 'de',
    'Medo': 'de', 'Alergia': 'a', 'Arrogância / Preconceito': 'contra',
  }
  if (alvoName === 'Mestre decide' || alvoName === 'Jogador decide') return `${tipo.name} (alvo a definir)`
  return `${tipo.name} ${prep[tipo.name] ?? 'de'} ${alvoName}`
}

/* ─── Sub-components ────────────────────────────────────────────── */

function DieRoll({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', damping: 14 }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className="w-14 h-14 rounded flex items-center justify-center font-display font-bold text-2xl border"
        style={{ background: 'rgba(200,146,42,0.12)', borderColor: 'var(--color-arcano-dim)', color: 'var(--color-arcano-glow)' }}
      >
        {value}
      </div>
      <span className="text-xs font-ui text-center" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    </motion.div>
  )
}

/* ─── State ──────────────────────────────────────────────────────── */

/**
 * roll1 and roll2 are the two primary D20s.
 * alergiaRoll is always pre-rolled so it's ready whichever die ends up as Tipo.
 * swapped determines which die is read as Tipo vs Alvo.
 */
interface RollState {
  roll1: number
  roll2: number
  alergiaRoll: number
  swapped: boolean
}

/* ─── Main Widget ────────────────────────────────────────────────── */

export function TraumaWidget() {
  const [state, setState] = useState<RollState | null>(null)
  const [rolling, setRolling] = useState(false)

  const generate = useCallback(() => {
    setRolling(true)
    setState(null)
    setTimeout(() => {
      setState({ roll1: d20(), roll2: d20(), alergiaRoll: d20(), swapped: false })
      setRolling(false)
    }, 400)
  }, [])

  const swap = () => setState(s => s ? { ...s, swapped: !s.swapped } : s)

  // Derive everything from raw rolls + swap flag
  const tipoRoll = state ? (state.swapped ? state.roll2 : state.roll1) : null
  const alvoRoll = state ? (state.swapped ? state.roll1 : state.roll2) : null
  const tipo     = tipoRoll !== null ? getTipo(tipoRoll) : null
  const isAlergia = tipo?.isAlergia ?? false
  const alvo     = alvoRoll !== null ? getAlvo(alvoRoll, ALVOS_GERAIS) : null
  const alvoBio  = isAlergia && state ? getAlvo(state.alergiaRoll, ALVOS_ALERGIA) : null
  const alvoFinal = alvoBio ?? alvo
  const narrative = tipo && alvoFinal ? narrativeName(tipo, alvoFinal.name) : ''

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ background: 'var(--color-deep)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <span style={{ color: 'var(--color-arcano)', fontSize: '1.1rem' }}>☽</span>
        <div>
          <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-arcano-glow)' }}>
            Gerador de Trauma
          </h3>
          <p className="text-xs mt-0.5 font-ui" style={{ color: 'var(--color-text-muted)' }}>
            Rola 1D20 para o Tipo e 1D20 para o Alvo — igual às tabelas do livro
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Roll button */}
        <button
          onClick={generate}
          disabled={rolling}
          className="w-full py-3 font-ui font-semibold text-sm uppercase tracking-widest transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          style={{ background: 'var(--color-arcano)', color: '#04060C', borderRadius: 2, letterSpacing: '0.15em' }}
        >
          {rolling ? 'Rolando…' : state ? 'Gerar Novo Trauma' : 'Gerar Trauma'}
        </button>

        {/* Results */}
        <AnimatePresence>
          {state && !rolling && tipo && alvo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Dice row */}
              <div className="flex gap-4 justify-center flex-wrap">
                <DieRoll
                  value={state.swapped ? state.roll2 : state.roll1}
                  label="Tipo (D20)"
                  delay={0}
                />
                <DieRoll
                  value={state.swapped ? state.roll1 : state.roll2}
                  label={isAlergia ? 'Alvo Geral (D20)' : 'Alvo (D20)'}
                  delay={0.08}
                />
                {isAlergia && (
                  <DieRoll value={state.alergiaRoll} label="Alvo de Alergia (D20)" delay={0.16} />
                )}
              </div>

              {/* Swap button */}
              <button
                onClick={swap}
                className="w-full py-2 rounded border text-sm font-ui font-semibold transition-all duration-150 hover:brightness-125"
                style={{
                  background: 'rgba(15,23,41,0.6)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ⇄ Trocar dados — usar {state.swapped ? state.roll1 : state.roll2} como Tipo
                {' '}e {state.swapped ? state.roll2 : state.roll1} como Alvo
              </button>

              {/* Tipo card */}
              <motion.div
                layout
                className="rounded border p-4"
                style={{ background: tipo.color, borderColor: tipo.textColor + '44' }}
              >
                <span className="text-xs font-ui uppercase tracking-widest" style={{ color: tipo.textColor, opacity: 0.7 }}>
                  Tipo · {tipo.rangeLabel}
                </span>
                <p className="font-display font-bold text-lg mt-1 mb-1" style={{ color: tipo.textColor }}>
                  {tipo.name}
                </p>
                <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {tipo.effect}
                </p>
              </motion.div>

              {/* Alvo card */}
              <motion.div
                layout
                className="rounded border p-4"
                style={{ background: 'rgba(26,36,64,0.6)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-ui uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    {isAlergia ? 'Alvo da Alergia' : 'Alvo'}
                  </span>
                  <span className="text-xs font-ui" style={{ color: 'var(--color-text-muted)' }}>
                    D20 → {isAlergia ? state.alergiaRoll : alvoRoll}
                  </span>
                </div>
                <p className="font-display font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
                  {alvoFinal?.name}
                </p>
                {isAlergia && (
                  <p className="text-xs mt-1 font-ui" style={{ color: 'var(--color-text-muted)' }}>
                    Alvo geral ignorado para Alergia — usada tabela específica
                  </p>
                )}
              </motion.div>

              {/* Narrative summary */}
              {narrative && (
                <motion.div
                  layout
                  className="rounded border p-4 text-center"
                  style={{ background: 'rgba(139,26,80,0.12)', borderColor: '#8B1A50' }}
                >
                  <p className="text-xs font-ui uppercase tracking-widest mb-1" style={{ color: '#C04070' }}>
                    Trauma resultante
                  </p>
                  <p className="font-display font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
                    {narrative}
                  </p>
                </motion.div>
              )}

              {tipo.isSpecial && (
                <motion.p layout className="text-center text-sm font-ui" style={{ color: 'var(--color-text-muted)' }}>
                  {tipo.name === 'Mestre decide'
                    ? 'O Mestre deve determinar o Tipo e o Alvo mais adequados à narrativa.'
                    : 'O jogador escolhe o Tipo e o Alvo que melhor representam o personagem.'}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
