import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TRAUMA_ALVOS, TRAUMA_ALVOS_ALERGIA,
  getTipo, getAlvo, traumaNarrativeName, d20,
} from './types'
import { Field, TagInput } from './CreatorUI'

interface TraumaRoll { roll1: number; roll2: number; alergiaRoll: number; swapped: boolean }

export function Step5History({ antecedentes, traumas, onChange }: {
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

  const tipoRoll    = traumaState ? (traumaState.swapped ? traumaState.roll2 : traumaState.roll1) : null
  const alvoRoll    = traumaState ? (traumaState.swapped ? traumaState.roll1 : traumaState.roll2) : null
  const tipo        = tipoRoll !== null ? getTipo(tipoRoll) : null
  const isAlergia   = tipo?.isAlergia ?? false
  const alvo        = alvoRoll !== null ? getAlvo(alvoRoll, TRAUMA_ALVOS) : null
  const alvoAlergia = isAlergia && traumaState ? getAlvo(traumaState.alergiaRoll, TRAUMA_ALVOS_ALERGIA) : null
  const alvoFinal   = alvoAlergia ?? alvo
  const narrative   = tipo && alvoFinal ? traumaNarrativeName(tipo, alvoFinal.name) : ''

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

      {/* ── Trauma generator ─────────────────────────────── */}
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

                {/* Result cards */}
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

        {/* Manual trauma entry */}
        <TagInput tags={traumas} onChange={v => onChange('traumas', v)} placeholder="Ou escreva um trauma manualmente…" />
      </div>
    </div>
  )
}
