import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Hammer, RotateCcw, Sparkles, X } from 'lucide-react'
import { DiceOverlay } from '@/components/widgets/DiceRollerWidget'
import type { DiceRollRequest } from '@/components/widgets/DiceRollerWidget'
import { useDiceLog } from '@/lib/diceLog'

interface CraftMechanicOverlayProps {
  accentColor: string
  onClose: () => void
}

type ToolDie = 6 | 8 | 10
type RoundOutcome = 'success' | 'break' | 'inconclusive'

const TOOL_DICE: { value: ToolDie; label: string }[] = [
  { value: 6, label: 'Normal' },
  { value: 8, label: 'Boa' },
  { value: 10, label: 'Profissional' },
]

const REFINEMENT_RESERVE = 999

export function CraftMechanicOverlay({ accentColor, onClose }: CraftMechanicOverlayProps) {
  const { addEntry } = useDiceLog()
  const [toolDie, setToolDie] = useState<ToolDie>(6)
  const [pm, setPm] = useState(REFINEMENT_RESERVE)
  const [rerolls, setRerolls] = useState(0)
  const [adjustments, setAdjustments] = useState(0)
  const [effectiveness, setEffectiveness] = useState(0)
  const [roundDice, setRoundDice] = useState<number[]>([])
  const [roundNumber, setRoundNumber] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<RoundOutcome | null>(null)
  const [message, setMessage] = useState('')
  const [activeRoll, setActiveRoll] = useState<{ kind: 'craft' | 'reroll'; index?: number } | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const diceCount = 3 + effectiveness

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 680px)')
    const updateViewport = () => setIsMobile(mediaQuery.matches)
    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  function rollCraft() {
    if (pm < 1 || roundDice.length > 0 || lastOutcome === 'break') return
    setPm(value => value - 1)
    setRoundNumber(value => value + 1)
    setActiveRoll({ kind: 'craft' })
  }

  function handleRollResult(results: number[]) {
    if (activeRoll?.kind === 'reroll' && activeRoll.index !== undefined) {
      setRoundDice(values => values.map((value, index) => index === activeRoll.index ? results[0] : value))
      setMessage('Dado rerrolado. Você ainda pode ajustar os valores antes de confirmar.')
    } else {
      setRoundDice(results)
      setMessage('Escolha quais dados rerrolar ou ajustar antes de confirmar.')
    }
    setActiveRoll(null)
  }

  function reroll(index: number) {
    if (rerolls < 1) return
    setRerolls(value => value - 1)
    setActiveRoll({ kind: 'reroll', index })
  }

  function adjust(index: number) {
    if (adjustments < 1) return
    setRoundDice(values => values.map((value, valueIndex) => valueIndex === index ? value + 1 : value))
    setAdjustments(value => value - 1)
  }

  function confirmRound() {
    if (roundDice.length === 0) return
    const highCount = roundDice.filter(value => value >= 6).length
    const lowCount = roundDice.filter(value => value <= 3).length
    const outcome: RoundOutcome = lowCount >= 2 ? 'break' : highCount >= 2 ? 'success' : 'inconclusive'
    const nextEffectiveness = outcome === 'success' ? effectiveness + 1 : effectiveness

    addEntry({
      type: 'craft',
      projectName: 'Ofício',
      ingredientName: 'Refino',
      toolDie,
      round: roundNumber,
      results: roundDice,
      outcome,
      effectiveness: nextEffectiveness,
      pmRemaining: pm,
    })

    setLastOutcome(outcome)
    setRoundDice([])
    if (outcome === 'success') {
      setEffectiveness(nextEffectiveness)
      setMessage(`Sucesso. Efetividade atual: ${nextEffectiveness}.`)
    } else if (outcome === 'break') {
      setMessage('Quebra. O item foi destruído.')
    } else {
      setMessage(`Rodada inconclusiva. Efetividade atual: ${effectiveness}.`)
    }
  }

  function finish() {
    setMessage(`Refino encerrado com ${effectiveness} Efetividade.`)
    setLastOutcome('success')
    setIsFinished(true)
  }

  function reset() {
    setPm(REFINEMENT_RESERVE)
    setRerolls(0)
    setAdjustments(0)
    setEffectiveness(0)
    setRoundDice([])
    setRoundNumber(0)
    setLastOutcome(null)
    setMessage('')
    setIsFinished(false)
  }

  const rollRequests: DiceRollRequest[] = [{ dieType: toolDie, count: diceCount }]

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Mecânica de Ofício">
      <div style={bandStyle}>
        <button onClick={onClose} aria-label="Fechar Ofício" title="Fechar" style={closeButtonStyle}><X size={20} /></button>

        <div style={topBarStyle(isMobile)}>
          <div style={toolBlockStyle}>
            <span style={eyebrowStyle}>Ferramenta</span>
            <select value={toolDie} onChange={event => setToolDie(Number(event.target.value) as ToolDie)} style={selectStyle(accentColor)}>
              {TOOL_DICE.map(option => <option key={option.value} value={option.value}>{option.label} · D{option.value}</option>)}
            </select>
          </div>

          <div style={titleBlockStyle}><strong>Ofício</strong></div>

          <div style={resourceBlockStyle(isMobile)}>
            <Counter label="Rerolar" value={rerolls} onChange={setRerolls} />
            <Counter label="Ajuste" value={adjustments} onChange={setAdjustments} />
          </div>
        </div>

        <div style={stageStyle}>
          {isFinished ? (
            <div style={finishedStyle}>
              <span style={eyebrowStyle}>Ofício concluído</span>
              <strong style={finishedValueStyle}>{effectiveness}</strong>
              <span style={messageStyle}>Efetividade realizada</span>
              <button onClick={reset} style={rollButtonStyle(accentColor)}>Novo Ofício</button>
            </div>
          ) : (
          <>
          {roundDice.length === 0 ? (
            <div style={emptyStageStyle}>
              <Sparkles size={25} color={accentColor} />
              {lastOutcome === 'break' ? <div style={breakStyle}><strong style={{ color: '#ef7777' }}>O item quebrou.</strong><button onClick={reset} style={finishButtonStyle}>Novo Ofício</button></div> : message ? <span>{message}</span> : <button onClick={rollCraft} disabled={pm < 1} style={rollButtonStyle(accentColor)}><Hammer size={17} /> Rolar Ofício</button>}
              {lastOutcome && lastOutcome !== 'break' && (
                <div style={decisionStyle}>
                  <button onClick={rollCraft} disabled={pm < 1} style={rollButtonStyle(accentColor)}>Continuar Rodada</button>
                  <button onClick={finish} style={finishButtonStyle}>Parar e Concluir</button>
                </div>
              )}
            </div>
          ) : (
            <div style={diceStageStyle(isMobile)}>
              {roundDice.map((value, index) => <div key={`${roundNumber}-${index}`} style={{ ...dieStyle, borderColor: value >= 6 ? '#8fd4a2' : value <= 3 ? '#ef7777' : 'rgba(255,255,255,0.28)' }}><button onClick={() => adjust(index)} disabled={adjustments < 1} title="Adicionar +1 neste dado" style={{ ...adjustButtonStyle, opacity: adjustments > 0 ? 1 : 0.32, cursor: adjustments > 0 ? 'pointer' : 'not-allowed' }}>+</button><strong style={dieValueStyle}>{value}</strong><button onClick={() => reroll(index)} disabled={rerolls < 1} title="Rerrolar este dado" style={{ ...rerollButtonStyle, opacity: rerolls > 0 ? 1 : 0.32, cursor: rerolls > 0 ? 'pointer' : 'not-allowed' }}><RotateCcw size={14} /></button></div>)}
              <button onClick={confirmRound} style={confirmButtonStyle(accentColor)}>Confirmar rodada</button>
            </div>
          )}
          {message && roundDice.length > 0 && <p style={messageStyle}>{message}</p>}
          </>
          )}
        </div>

        <div style={bottomBarStyle}>
          <div style={effectivenessStyle}><span style={eyebrowStyle}>Efetividade</span><strong style={{ color: accentColor, fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 0.95 }}>{effectiveness}</strong></div>
        </div>
      </div>

      {activeRoll && <DiceOverlay dice={activeRoll.kind === 'reroll' ? [{ dieType: toolDie, count: 1 }] : rollRequests} onClose={() => setActiveRoll(null)} onResult={handleRollResult} />}
    </div>
  )
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label style={counterStyle}>
      <span style={eyebrowStyle}>{label}</span>
      <span style={counterControlStyle}>
        <button type="button" onClick={() => onChange(value + 1)} aria-label={`Aumentar ${label}`} style={counterButtonStyle}><ChevronUp size={14} /></button>
        <input type="number" min={0} value={value} onChange={event => onChange(Math.max(0, Number(event.target.value)))} style={counterInputStyle} />
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Diminuir ${label}`} style={counterButtonStyle}><ChevronDown size={14} /></button>
      </span>
    </label>
  )
}

const overlayStyle = { position: 'fixed' as const, inset: 0, zIndex: 119, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.76)' }
const bandStyle = { position: 'relative' as const, width: '100%', maxHeight: '100dvh', overflowY: 'auto' as const, padding: '22px clamp(16px, 5vw, 72px) 20px', background: 'linear-gradient(180deg, #080b10 0%, #030405 58%, #080b10 100%)', borderTop: '1px solid rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 18px 80px rgba(0,0,0,0.8)' }
const topBarStyle = (isMobile: boolean) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(150px, 1fr) minmax(140px, 1fr) minmax(220px, 1fr)', gap: isMobile ? 14 : 24, alignItems: isMobile ? 'center' as const : 'start' as const, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' })
const toolBlockStyle = { display: 'flex', flexDirection: 'column' as const, gap: 7, alignItems: 'flex-start' as const, padding: '4px 0' }
const titleBlockStyle = { display: 'flex', flexDirection: 'column' as const, gap: 4, alignItems: 'center' as const, color: '#f5f7fa', fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em' }
const resourceBlockStyle = (isMobile: boolean) => ({ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', gap: 10, width: '100%' })
const counterStyle = { display: 'flex', flexDirection: 'column' as const, gap: 6, alignItems: 'center', padding: '7px 8px 8px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6 }
const counterInputStyle = { boxSizing: 'border-box' as const, width: 64, height: 30, padding: '3px 5px', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 3, background: '#11151b', color: '#f5f7fa', fontFamily: 'var(--font-display)', fontSize: 16, textAlign: 'center' as const, outline: 'none' }
const stageStyle = { minHeight: 250, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', gap: 17, padding: '22px 0' }
const emptyStageStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 13, color: 'rgba(220,230,240,0.68)', fontFamily: 'var(--font-ui)', fontSize: 12, textAlign: 'center' as const }
const breakStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 14, padding: '12px 24px', border: '1px solid rgba(239,119,119,0.28)', borderRadius: 8, background: 'rgba(239,119,119,0.06)' }
const diceStageStyle = (isMobile: boolean) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' as const, gap: isMobile ? 7 : 12, maxWidth: 960, width: '100%' })
const dieStyle = { width: 70, minHeight: 132, boxSizing: 'border-box' as const, padding: '9px 8px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'space-between', gap: 8, border: '1px solid', borderRadius: 8, background: 'linear-gradient(160deg, rgba(26,38,58,0.9), rgba(9,14,24,0.96))', color: '#f5f7fa', boxShadow: '0 8px 20px rgba(0,0,0,0.22)' }
const dieValueStyle = { fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, lineHeight: 1, color: '#f7fbff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }
const adjustButtonStyle = { width: 42, height: 25, display: 'grid', placeItems: 'center', padding: 0, border: '1px solid rgba(230,184,106,0.62)', borderRadius: 4, background: 'rgba(230,184,106,0.13)', color: '#f0c579', fontSize: 19, lineHeight: 1, fontWeight: 700, cursor: 'pointer' }
const rerollButtonStyle = { width: 42, height: 28, display: 'grid', placeItems: 'center', padding: 0, border: '1px solid rgba(190,210,232,0.34)', borderRadius: 4, background: 'rgba(190,210,232,0.1)', color: '#dce9f6', cursor: 'pointer' }
const bottomBarStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }
const effectivenessStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4, margin: '0 auto', textAlign: 'center' as const }
const finishedStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 250, textAlign: 'center' as const }
const finishedValueStyle = { color: '#f5f7fa', fontFamily: 'var(--font-display)', fontSize: 68, lineHeight: 0.95, textShadow: '0 0 28px rgba(255,255,255,0.14)' }
const decisionStyle = { display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center', gap: 9 }
const eyebrowStyle = { margin: 0, color: 'rgba(220,230,240,0.52)', fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' as const }
const messageStyle = { margin: 0, color: 'rgba(220,230,240,0.7)', fontFamily: 'var(--font-ui)', fontSize: 11, textAlign: 'center' as const, letterSpacing: '0.02em' }
const selectStyle = (accentColor: string) => ({ minWidth: 126, padding: '8px 27px 8px 10px', border: `1px solid ${accentColor}66`, borderRadius: 5, background: '#11151b', color: '#f5f7fa', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, outline: 'none' })
const counterControlStyle = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3 }
const counterButtonStyle = { width: 64, height: 20, display: 'grid', placeItems: 'center', padding: 0, border: '1px solid rgba(255,255,255,0.16)', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: '#e8eef5', cursor: 'pointer' }
const rollButtonStyle = (accentColor: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: `1px solid ${accentColor}88`, borderRadius: 5, background: `${accentColor}18`, color: '#f5f7fa', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: `0 5px 18px ${accentColor}18` })
const confirmButtonStyle = (accentColor: string) => ({ marginLeft: 10, padding: '12px 16px', border: `1px solid ${accentColor}88`, borderRadius: 5, background: `${accentColor}20`, color: '#f5f7fa', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, cursor: 'pointer' })
const finishButtonStyle = { padding: '9px 14px', border: '1px solid rgba(255,255,255,0.24)', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: 'rgba(235,240,246,0.86)', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }
const closeButtonStyle = { position: 'absolute' as const, top: 10, right: 12, zIndex: 2, width: 28, height: 28, display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.16)', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }
