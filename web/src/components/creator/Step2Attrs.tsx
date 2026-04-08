import type { CharacterAttributes } from '@/data/characterTypes'
import { calcHP, calcSanidade } from '@/lib/localCharacters'
import { ATTR_GROUPS } from './types'
import { Stepper, StatPill } from './CreatorUI'

export function Step2Attrs({ attrs, onChange }: {
  attrs: CharacterAttributes
  onChange: (k: keyof CharacterAttributes, v: number) => void
}) {
  const hp  = calcHP(attrs.fisico)
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
          <StatPill label="Pontos de Vida" value={hp}  color="#6EC840" />
          <StatPill label="Sanidade"       value={san} color="#D04040" />
        </div>
      </div>
    </div>
  )
}
