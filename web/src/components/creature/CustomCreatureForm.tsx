import { useState } from 'react'
import type { CustomCreature, CreatureEntry, CreatureAction, CreatureVariant } from '@/data/creatureTypes'
import { CREATURE_ACCENT, CREATURE_ACCENT_DIM, CREATURE_ACCENT_GLOW } from './constants'

export interface CustomCreatureFormData {
  name: string
  levelRange: string
  style: string
  lore: string
  diceBase: string
  hp: number
  da: number
  dp: number
  attributes: { fisico: number; destreza: number; intelecto: number; influencia: number }
  immune: string[]
  vulnerable: string[]
  interactions: CreatureEntry[]
  actions: CreatureAction[]
  reactions: CreatureAction[]
  variants: CreatureVariant[]
  isPublic: boolean
  imageUrl: string | null
  imageFile: File | null
}

function emptyForm(): CustomCreatureFormData {
  return {
    name: '',
    levelRange: '1',
    style: '',
    lore: '',
    diceBase: '2D6',
    hp: 10,
    da: 1,
    dp: 1,
    attributes: { fisico: 1, destreza: 1, intelecto: 1, influencia: 1 },
    immune: [],
    vulnerable: [],
    interactions: [],
    actions: [],
    reactions: [],
    variants: [],
    isPublic: false,
    imageUrl: null,
    imageFile: null,
  }
}

export function creatureToFormData(c: CustomCreature): CustomCreatureFormData {
  return {
    name: c.name,
    levelRange: c.levelRange,
    style: c.style,
    lore: c.lore,
    diceBase: c.diceBase,
    hp: c.hp,
    da: c.da,
    dp: c.dp,
    attributes: { ...c.attributes },
    immune: [...c.immune],
    vulnerable: [...c.vulnerable],
    interactions: [...c.interactions],
    actions: [...c.actions],
    reactions: [...c.reactions],
    variants: [...c.variants],
    isPublic: c.isPublic,
    imageUrl: c.imageUrl ?? c.image ?? null,
    imageFile: null,
  }
}

// ── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid rgba(255,255,255,0.1)`,
  borderRadius: 4,
  padding: '0.45rem 0.75rem',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.82rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-muted)',
  display: 'block',
  marginBottom: '0.35rem',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: CREATURE_ACCENT_GLOW,
  marginBottom: '0.75rem',
  paddingBottom: '0.35rem',
  borderBottom: `1px solid ${CREATURE_ACCENT_DIM}`,
}

// ── Tag list input ────────────────────────────────────────────────────────────

function TagListInput({
  label,
  values,
  onChange,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  function add() {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed])
    setDraft('')
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Adicionar..."
        />
        <button
          type="button"
          onClick={add}
          style={{ padding: '0.45rem 0.75rem', borderRadius: 4, background: CREATURE_ACCENT_DIM, border: `1px solid ${CREATURE_ACCENT}`, color: 'var(--color-text-primary)', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {values.map(v => (
          <span
            key={v}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', borderRadius: 3, background: CREATURE_ACCENT_DIM, border: `1px solid ${CREATURE_ACCENT}`, fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter(x => x !== v))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', padding: 0, lineHeight: 1 }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Entry list (name + description) ──────────────────────────────────────────

function EntryListInput({
  label,
  values,
  onChange,
  withOnce,
}: {
  label: string
  values: (CreatureEntry | CreatureAction)[]
  onChange: (v: (CreatureEntry | CreatureAction)[]) => void
  withOnce?: boolean
}) {
  function addItem() {
    onChange([...values, { name: '', description: '', ...(withOnce ? {} : {}) }])
  }

  function updateItem(index: number, field: string, value: string) {
    const updated = values.map((item, i) => i === index ? { ...item, [field]: value } : item)
    onChange(updated)
  }

  function removeItem(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {values.map((item, index) => (
          <div
            key={index}
            style={{ padding: '0.65rem', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: `1px solid ${CREATURE_ACCENT_DIM}`, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Nome"
                value={item.name}
                onChange={e => updateItem(index, 'name', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', padding: '0.45rem 0.3rem', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }}
              placeholder="Descrição"
              value={item.description}
              onChange={e => updateItem(index, 'description', e.target.value)}
            />
            {withOnce && (
              <input
                style={inputStyle}
                placeholder="Condição 'uma vez' (opcional)"
                value={(item as CreatureAction).once ?? ''}
                onChange={e => updateItem(index, 'once', e.target.value)}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          style={{ padding: '0.4rem', borderRadius: 4, background: 'transparent', border: `1px dashed ${CREATURE_ACCENT_DIM}`, color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer', textAlign: 'center' }}
        >
          + Adicionar {label}
        </button>
      </div>
    </div>
  )
}

// ── Variant list ──────────────────────────────────────────────────────────────

function VariantListInput({
  values,
  onChange,
}: {
  values: CreatureVariant[]
  onChange: (v: CreatureVariant[]) => void
}) {
  function addItem() {
    onChange([...values, { name: '', diceBase: '2D6', hp: 10, da: 1, note: '' }])
  }

  function updateItem(index: number, field: keyof CreatureVariant, value: string | number) {
    const updated = values.map((item, i) => i === index ? { ...item, [field]: value } : item)
    onChange(updated)
  }

  function removeItem(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label style={labelStyle}>Variantes</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {values.map((variant, index) => (
          <div
            key={index}
            style={{ padding: '0.65rem', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: `1px solid ${CREATURE_ACCENT_DIM}`, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Nome da variante"
                value={variant.name}
                onChange={e => updateItem(index, 'name', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', padding: '0.45rem 0.3rem', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.55rem' }}>Dados</label>
                <input style={inputStyle} value={variant.diceBase} onChange={e => updateItem(index, 'diceBase', e.target.value)} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.55rem' }}>HP</label>
                <input style={inputStyle} type="number" min={0} value={variant.hp} onChange={e => updateItem(index, 'hp', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.55rem' }}>DA</label>
                <input style={inputStyle} type="number" min={0} value={variant.da} onChange={e => updateItem(index, 'da', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.55rem' }}>Nota</label>
                <input style={inputStyle} value={variant.note} onChange={e => updateItem(index, 'note', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          style={{ padding: '0.4rem', borderRadius: 4, background: 'transparent', border: `1px dashed ${CREATURE_ACCENT_DIM}`, color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer', textAlign: 'center' }}
        >
          + Adicionar variante
        </button>
      </div>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface CustomCreatureFormProps {
  initial?: CustomCreature
  onSubmit: (data: CustomCreatureFormData) => Promise<void>
  submitting: boolean
  error: string | null
}

export function CustomCreatureForm({ initial, onSubmit, submitting, error }: CustomCreatureFormProps) {
  const [form, setForm] = useState<CustomCreatureFormData>(
    initial ? creatureToFormData(initial) : emptyForm()
  )
  const [imageMode, setImageMode] = useState<'url' | 'upload'>(
    initial?.imageUrl || initial?.image ? 'url' : 'url'
  )
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.imageUrl ?? initial?.image ?? null
  )

  function set<K extends keyof CustomCreatureFormData>(key: K, value: CustomCreatureFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function setAttr(key: keyof CustomCreatureFormData['attributes'], value: number) {
    setForm(prev => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    set('imageFile', file)
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(form.imageUrl)
    }
  }

  function handleUrlChange(url: string) {
    set('imageUrl', url || null)
    setImagePreview(url || null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Identidade */}
      <section>
        <p style={sectionLabel}>Identidade</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome da criatura" />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Faixa de Nível</label>
            <input style={inputStyle} value={form.levelRange} onChange={e => set('levelRange', e.target.value)} placeholder="ex: 1–3" />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Estilo</label>
            <input style={inputStyle} value={form.style} onChange={e => set('style', e.target.value)} placeholder="ex: Besta · Voador" />
          </div>
          <div style={{ ...fieldWrap, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Lore</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              value={form.lore}
              onChange={e => set('lore', e.target.value)}
              placeholder="Descrição e contexto narrativo..."
            />
          </div>
        </div>
      </section>

      {/* Imagem */}
      <section>
        <p style={sectionLabel}>Imagem</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {(['url', 'upload'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setImageMode(mode)}
              style={{
                padding: '0.3rem 0.8rem', borderRadius: 4, fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer',
                background: imageMode === mode ? CREATURE_ACCENT_DIM : 'transparent',
                border: `1px solid ${imageMode === mode ? CREATURE_ACCENT : 'rgba(255,255,255,0.1)'}`,
                color: imageMode === mode ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              }}
            >
              {mode === 'url' ? 'URL' : 'Upload'}
            </button>
          ))}
        </div>
        {imageMode === 'url' ? (
          <input
            style={inputStyle}
            type="url"
            placeholder="https://..."
            value={form.imageUrl ?? ''}
            onChange={e => handleUrlChange(e.target.value)}
          />
        ) : (
          <input
            style={inputStyle}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        )}
        {imagePreview && (
          <div style={{ marginTop: '0.6rem', width: 100, height: 100, borderRadius: 6, overflow: 'hidden', border: `1px solid ${CREATURE_ACCENT_DIM}` }}>
            <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </section>

      {/* Stats */}
      <section>
        <p style={sectionLabel}>Estatísticas</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '0.75rem' }}>
          {(['hp', 'da', 'dp'] as const).map(stat => (
            <div key={stat} style={fieldWrap}>
              <label style={{ ...labelStyle, textTransform: 'uppercase' }}>{stat}</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                value={form[stat]}
                onChange={e => set(stat, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
          <div style={fieldWrap}>
            <label style={labelStyle}>Dados</label>
            <input style={inputStyle} value={form.diceBase} onChange={e => set('diceBase', e.target.value)} placeholder="2D6" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
          {(['fisico', 'destreza', 'intelecto', 'influencia'] as const).map(attr => (
            <div key={attr} style={fieldWrap}>
              <label style={{ ...labelStyle, textTransform: 'capitalize' }}>{attr}</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                max={99}
                value={form.attributes[attr]}
                onChange={e => setAttr(attr, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Imunidades e Vulnerabilidades */}
      <section>
        <p style={sectionLabel}>Resistências</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <TagListInput label="Imune a" values={form.immune} onChange={v => set('immune', v)} />
          <TagListInput label="Vulnerável a" values={form.vulnerable} onChange={v => set('vulnerable', v)} />
        </div>
      </section>

      {/* Interações */}
      <section>
        <p style={sectionLabel}>Interações</p>
        <EntryListInput
          label="Interação"
          values={form.interactions}
          onChange={v => set('interactions', v as CreatureEntry[])}
        />
      </section>

      {/* Ações */}
      <section>
        <p style={sectionLabel}>Ações</p>
        <EntryListInput
          label="Ação"
          values={form.actions}
          onChange={v => set('actions', v as CreatureAction[])}
          withOnce
        />
      </section>

      {/* Reações */}
      <section>
        <p style={sectionLabel}>Reações</p>
        <EntryListInput
          label="Reação"
          values={form.reactions}
          onChange={v => set('reactions', v as CreatureAction[])}
          withOnce
        />
      </section>

      {/* Variantes */}
      <section>
        <p style={sectionLabel}>Variantes</p>
        <VariantListInput values={form.variants} onChange={v => set('variants', v)} />
      </section>

      {/* Visibilidade */}
      <section>
        <p style={sectionLabel}>Visibilidade</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={e => set('isPublic', e.target.checked)}
            style={{ accentColor: CREATURE_ACCENT, width: 16, height: 16 }}
          />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Tornar pública (visível para todos)
          </span>
        </label>
      </section>

      {error && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: '#C05050', padding: '0.5rem 0.75rem', background: 'rgba(192,80,80,0.08)', border: '1px solid rgba(192,80,80,0.25)', borderRadius: 4 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '0.7rem 1.5rem',
          borderRadius: 4,
          background: submitting ? 'rgba(160,48,32,0.4)' : CREATURE_ACCENT,
          border: `1px solid ${CREATURE_ACCENT}`,
          color: '#F0D0C0',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          alignSelf: 'flex-start',
        }}
      >
        {submitting ? 'Salvando...' : 'Salvar Criatura'}
      </button>
    </form>
  )
}
