import { useState } from 'react'
import { RACES } from './types'
import { Field, TextInput } from './CreatorUI'

export function Step1Identity({ data, onChange }: {
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
