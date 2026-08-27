import type { DiceLogEntry, SkillLogEntry, ArcanoLogEntry, DamageLogEntry, FreeLogEntry } from '@/lib/diceLog'
import { getAccent } from './types'
import { STATE_META } from './ArcaneStates'

/* ────────────────────────────────────────────────────────────────
   Shared constants
   ──────────────────────────────────────────────────────────────── */

export const ATTR_LABELS: Record<string, string> = {
  fisico: 'Físico',
  destreza: 'Destreza',
  intelecto: 'Intelecto',
  influencia: 'Influência',
}

export const TYPE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  skill:  { label: 'PERÍCIA', color: '#7EB8F0', bg: 'rgba(80,140,200,0.15)' },
  arcano: { label: 'ARCANO',  color: '#C090F0', bg: 'rgba(140,80,200,0.15)' },
  damage: { label: 'DANO',    color: '#F08080', bg: 'rgba(200,80,80,0.15)'  },
  free:   { label: 'LIVRE',   color: '#A0C890', bg: 'rgba(100,180,100,0.15)'},
}

export const MOD_LABEL: Record<string, string> = {
  potencia: 'Potência', complexidade: 'Complexidade', forma: 'Forma', controle: 'Controle',
}

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const day   = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year  = d.getFullYear()
  const hour  = String(d.getHours()).padStart(2, '0')
  const min   = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hour}:${min}`
}

/* ────────────────────────────────────────────────────────────────
   Dice chip — used in Skill + Arcano entries
   ──────────────────────────────────────────────────────────────── */

export function DiceChip({ value, chosen }: { value: number; chosen: boolean }) {
  const isSpec12 = chosen && value === 12
  const isSpec1  = chosen && value === 1
  const col = isSpec12 ? '#ffd700' : isSpec1 ? '#ff4050' : chosen ? '#a0c8f8' : 'rgba(100,120,150,0.4)'
  return (
    <div
      style={{
        position: 'relative',
        width: chosen ? 34 : 26,
        height: chosen ? 34 : 26,
        borderRadius: 7,
        border: `${chosen ? 2 : 1}px solid ${col}`,
        background: 'rgba(8,14,30,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Cinzel, serif',
        fontSize: chosen ? 15 : 11,
        fontWeight: 700,
        color: col,
        boxShadow: chosen ? `0 0 ${isSpec12 || isSpec1 ? 16 : 8}px ${col}55` : 'none',
        opacity: chosen ? 1 : 0.4,
        flexShrink: 0,
      }}
    >
      {value}
      {!chosen && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 7, background: 'rgba(0,0,0,0.3)' }} />
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Damage chip
   ──────────────────────────────────────────────────────────────── */

export function DamageChip({ value, dieType, modifier }: { value: number; dieType: number; modifier: number }) {
  const hasBonus = modifier !== 0
  const bonusColor = modifier > 0 ? '#6EC840' : '#D04040'
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {hasBonus && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 11,
          color: bonusColor,
          textShadow: `0 0 6px ${bonusColor}`,
          lineHeight: 1,
        }}>
          {modifier > 0 ? `+${modifier}` : String(modifier)}
        </span>
      )}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        border: '1.5px solid rgba(140,160,200,0.35)',
        background: 'rgba(8,14,30,0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 13, color: '#c8e0f8', lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: 'rgba(160,180,200,0.5)', lineHeight: 1, marginTop: 1 }}>
          D{dieType}
        </span>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Free chip
   ──────────────────────────────────────────────────────────────── */

export function FreeChip({ value }: { value: number }) {
  return (
    <div style={{
      width: 30,
      height: 30,
      borderRadius: 6,
      border: '1.5px solid rgba(140,200,130,0.35)',
      background: 'rgba(8,14,30,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Cinzel, serif',
      fontWeight: 700,
      fontSize: 13,
      color: '#a0c890',
      flexShrink: 0,
    }}>
      {value}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Result row
   ──────────────────────────────────────────────────────────────── */

export function ResultRow({ value, stateInfo }: {
  value: number
  stateInfo: { label: string; color: string } | null
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontWeight: 800,
        fontSize: 22,
        color: stateInfo ? stateInfo.color : '#a0c8f8',
        lineHeight: 1,
      }}>
        {value}
      </span>
      {stateInfo && (
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: stateInfo.color,
          border: `1px solid ${stateInfo.color}66`,
          borderRadius: 4,
          padding: '2px 6px',
          background: `${stateInfo.color}18`,
        }}>
          {stateInfo.label}
        </span>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Shared entry shell
   ──────────────────────────────────────────────────────────────── */

export function EntryShell({
  badge,
  title,
  titleColor,
  timestamp,
  children,
}: {
  badge: { label: string; color: string; bg: string }
  title: string
  titleColor?: string
  timestamp: number
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'rgba(15,23,41,0.7)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.color}44`,
            borderRadius: 4,
            padding: '2px 6px',
            flexShrink: 0,
          }}>
            {badge.label}
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 700,
            color: titleColor ?? 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}>
          {formatTime(timestamp)}
        </span>
      </div>
      {children}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Entry renderers
   ──────────────────────────────────────────────────────────────── */

function SkillEntry({ e }: { e: SkillLogEntry }) {
  const badge = TYPE_BADGE.skill
  const chosenSet = new Set(e.chosenIndices)
  const stateInfo = e.specialState ? STATE_META[e.specialState] : null

  const bonusParts: string[] = []
  if (e.attrValue > 0) bonusParts.push(`${ATTR_LABELS[e.attrLabel] ?? e.attrLabel} +${e.attrValue}`)
  if (e.skillValue > 0) bonusParts.push(`Perícia +${e.skillValue}`)
  if (e.modifier !== 0) bonusParts.push(`Mod ${e.modifier > 0 ? '+' : ''}${e.modifier}`)

  return (
    <EntryShell badge={badge} title={e.skillLabel} timestamp={e.timestamp}>
      {bonusParts.length > 0 && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
          {bonusParts.join(' • ')}
        </p>
      )}
      {!!e.exhaustionPenalty && (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: '#D04040', letterSpacing: '0.04em' }}>
          Exaustão −{Math.abs(e.exhaustionPenalty)}
        </span>
      )}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        {e.results.map((v, i) => (
          <DiceChip key={i} value={v} chosen={chosenSet.has(i)} />
        ))}
      </div>
      <ResultRow value={e.finalResult} stateInfo={stateInfo} />
    </EntryShell>
  )
}

function ArcanoEntry({ e }: { e: ArcanoLogEntry }) {
  const badge = TYPE_BADGE.arcano
  const elemColor = getAccent(e.selectedElement).text

  const bonusParts: string[] = []
  if (e.entropiaBonus > 0) bonusParts.push(`Entropia +${e.entropiaBonus}`)
  if (e.elementBonus < 0) bonusParts.push(`Antítese −10`)

  return (
    <EntryShell badge={badge} title={e.selectedElement} titleColor={elemColor} timestamp={e.timestamp}>
      {bonusParts.length > 0 && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
          {bonusParts.join(' • ')}
        </p>
      )}
      {!!e.exhaustionPenalty && (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: '#D04040', letterSpacing: '0.04em' }}>
          Exaustão −{Math.abs(e.exhaustionPenalty)}
        </span>
      )}
      {(e.allDiceResults ?? []).length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {(e.allDiceResults ?? []).map((v, i) => (
            <DiceChip key={i} value={v} chosen={true} />
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
        {Object.entries(e.modifierResults ?? {}).map(([k, res]) => {
          const stateInfo = res.specialState ? STATE_META[res.specialState] : null
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'rgba(180,90,240,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {MOD_LABEL[k] ?? k}
              </span>
              <ResultRow value={res.total} stateInfo={stateInfo} />
            </div>
          )
        })}
      </div>
    </EntryShell>
  )
}

function DamageEntry({ e }: { e: DamageLogEntry }) {
  const badge = TYPE_BADGE.damage
  return (
    <EntryShell badge={badge} title={e.equipmentName} timestamp={e.timestamp}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
        {e.damageStr}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {e.results.map((v, i) => (
          <DamageChip key={i} value={v} dieType={e.flatDieTypes[i] ?? 6} modifier={e.modifiers[i] ?? 0} />
        ))}
      </div>
    </EntryShell>
  )
}

function FreeEntry({ e }: { e: FreeLogEntry }) {
  const badge = TYPE_BADGE.free
  const diceSummary = Object.entries(e.selections)
    .filter(([, n]) => n > 0)
    .map(([t, n]) => `${n}D${t}`)
    .join(' + ')

  return (
    <EntryShell badge={badge} title={diceSummary || 'Livre'} timestamp={e.timestamp}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {e.results.map((v, i) => (
          <FreeChip key={i} value={v} />
        ))}
      </div>
      <p style={{
        fontFamily: 'Cinzel, serif',
        fontWeight: 700,
        fontSize: 18,
        color: '#A0C890',
        marginTop: 2,
      }}>
        {e.total}
      </p>
    </EntryShell>
  )
}

/* ────────────────────────────────────────────────────────────────
   Entry dispatcher
   ──────────────────────────────────────────────────────────────── */

export function LogEntry({ entry }: { entry: DiceLogEntry }) {
  switch (entry.type) {
    case 'skill':  return <SkillEntry  e={entry} />
    case 'arcano': return <ArcanoEntry e={entry} />
    case 'damage': return <DamageEntry e={entry} />
    case 'free':   return <FreeEntry   e={entry} />
  }
}
