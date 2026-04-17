import { Field } from './CreatorUI'

const MAX_CHARS = 4000

export function Step6Historia({ historia, onChange }: {
  historia: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
        Escreva livremente a história do seu personagem — sua origem, motivações, eventos marcantes e o que o trouxe até aqui.
      </p>

      <Field label="História" hint="Opcional. Você pode escrever quantos parágrafos quiser.">
        <div style={{ position: 'relative' }}>
          <textarea
            value={historia}
            onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Era uma vez, nas ilhas flutuantes do Mar de Nuvens…"
            rows={14}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              outline: 'none',
              color: '#EEF4FC',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              resize: 'vertical',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-arcano)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          <span style={{
            position: 'absolute', bottom: 8, right: 10,
            fontFamily: 'var(--font-ui)', fontSize: '0.6rem',
            color: historia.length > MAX_CHARS * 0.9
              ? 'rgba(232,128,58,0.7)'
              : 'rgba(255,255,255,0.2)',
            pointerEvents: 'none',
          }}>
            {historia.length} / {MAX_CHARS}
          </span>
        </div>
      </Field>
    </div>
  )
}
