import type { CharacterSkills } from '@/data/characterTypes'
import { ATTR_GROUPS } from './types'
import { Stepper } from './CreatorUI'

export function Step3Skills({ skills, talents, totalLevel, onChange, onTalentToggle }: {
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
          Defina o valor de cada perícia. Clique no diamante para marcar como{' '}
          <strong style={{ color: 'var(--color-arcano-glow)' }}>Talento</strong> — sem limite.
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
                    <button
                      onClick={() => onTalentToggle(skill.key)}
                      title={hasTalent ? 'Remover talento' : 'Marcar como talento'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1, padding: 0, flexShrink: 0, color: hasTalent ? g.color : 'rgba(255,255,255,0.2)', transition: 'color 0.15s' }}
                    >
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
