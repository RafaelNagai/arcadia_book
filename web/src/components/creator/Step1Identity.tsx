import { useState } from 'react'
import { RACES, NATIONALITIES, RELIGIONS } from './types'
import { Field, TextInput, ImageUpload } from './CreatorUI'

export function Step1Identity({ data, image, onImageChange, onChange }: {
  data: { name: string; race: string; nationality: string; religion: string; concept: string; quote: string }
  image: string | null
  onImageChange: (v: string | null) => void
  onChange: (k: string, v: string) => void
}) {
  const isExistingCustomRace = !RACES.slice(0, -1).includes(data.race) && data.race !== ''
  const [customRace, setCustomRace] = useState(isExistingCustomRace ? data.race : '')
  const [raceOutroActive, setRaceOutroActive] = useState(isExistingCustomRace)

  const isExistingCustomNat = !NATIONALITIES.slice(0, -1).includes(data.nationality) && data.nationality !== ''
  const [customNationality, setCustomNationality] = useState(isExistingCustomNat ? data.nationality : '')
  const [natOutroActive, setNatOutroActive] = useState(isExistingCustomNat)

  const isExistingCustomRel = !RELIGIONS.slice(0, -1).includes(data.religion) && data.religion !== ''
  const [customReligion, setCustomReligion] = useState(isExistingCustomRel ? data.religion : '')
  const [relOutroActive, setRelOutroActive] = useState(isExistingCustomRel)

  function optionButtonStyle(active: boolean) {
    return {
      padding: '0.35rem 0.75rem', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
      background: active ? 'rgba(200,146,42,0.15)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? 'rgba(200,146,42,0.4)' : 'rgba(255,255,255,0.1)'}`,
      color: active ? 'var(--color-arcano-glow)' : 'var(--color-text-muted)',
      fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.08em',
    }
  }

  return (
    <div className="space-y-5">
      <Field label="Imagem do Personagem" hint="Opcional · arquivo local ou URL externa">
        <ImageUpload value={image} onChange={onImageChange} />
      </Field>

      <Field label="Nome do Personagem">
        <TextInput value={data.name} onChange={v => onChange('name', v)} placeholder="Ex: Kalista" />
      </Field>

      <Field label="Raça">
        <div className="flex flex-wrap gap-2 mb-2">
          {RACES.map(r => {
            const active = r === 'Outro' ? raceOutroActive : (!raceOutroActive && data.race === r)
            return (
              <button key={r} onClick={() => {
                if (r === 'Outro') {
                  setRaceOutroActive(true)
                  onChange('race', customRace)
                } else {
                  setRaceOutroActive(false)
                  onChange('race', r)
                }
              }}
                style={optionButtonStyle(active)}>
                {r}
              </button>
            )
          })}
        </div>
        {raceOutroActive && (
          <TextInput value={customRace} onChange={v => { setCustomRace(v); onChange('race', v) }} placeholder="Escreva a raça…" />
        )}
      </Field>

      <Field label="Nacionalidade" hint="Opcional">
        <div className="flex flex-wrap gap-2 mb-2">
          {NATIONALITIES.map(n => {
            const active = n === 'Outro' ? natOutroActive : (!natOutroActive && data.nationality === n)
            return (
              <button key={n} onClick={() => {
                if (n === 'Outro') {
                  setNatOutroActive(true)
                  onChange('nationality', customNationality)
                } else {
                  setNatOutroActive(false)
                  onChange('nationality', n)
                }
              }}
                style={optionButtonStyle(active)}>
                {n}
              </button>
            )
          })}
        </div>
        {natOutroActive && (
          <TextInput value={customNationality} onChange={v => { setCustomNationality(v); onChange('nationality', v) }} placeholder="Escreva a nacionalidade…" />
        )}
      </Field>

      <Field label="Religião" hint="Opcional">
        <div className="flex flex-wrap gap-2 mb-2">
          {RELIGIONS.map(r => {
            const active = r === 'Outro' ? relOutroActive : (!relOutroActive && data.religion === r)
            return (
              <button key={r} onClick={() => {
                if (r === 'Outro') {
                  setRelOutroActive(true)
                  onChange('religion', customReligion)
                } else {
                  setRelOutroActive(false)
                  onChange('religion', r)
                }
              }}
                style={optionButtonStyle(active)}>
                {r}
              </button>
            )
          })}
        </div>
        {relOutroActive && (
          <TextInput value={customReligion} onChange={v => { setCustomReligion(v); onChange('religion', v) }} placeholder="Escreva a religião…" />
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
