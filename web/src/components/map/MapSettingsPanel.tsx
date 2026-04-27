import { useState } from 'react'
import { api } from '@/lib/apiClient'
import type { GameMap } from '@/lib/mapTypes'

interface Props {
  campaignId: string
  map: GameMap
  onSave: (updated: GameMap) => void
  onClose: () => void
}

export function MapSettingsPanel({ campaignId, map, onSave, onClose }: Props) {
  const [title, setTitle] = useState(map.title)
  const [gridEnabled, setGridEnabled] = useState(map.gridEnabled)
  const [gridSize, setGridSize] = useState(map.gridSize)
  const [defaultVisionRadius, setDefaultVisionRadius] = useState(map.defaultVisionRadius)
  const [defaultTokenSize, setDefaultTokenSize] = useState(map.defaultTokenSize ?? 1)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await api.maps.update(campaignId, map.id, {
        title: title.trim() || map.title,
        grid_enabled: gridEnabled,
        grid_size: gridSize,
        default_vision_radius: defaultVisionRadius,
        default_token_size: defaultTokenSize,
      })
      onSave(res.map as GameMap)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '1.5rem', width: 380, maxWidth: 'calc(100vw - 2rem)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', margin: 0 }}>
          Configurações do Mapa
        </p>

        <Field label="Nome do mapa">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Toggle label="Grid" value={gridEnabled} onChange={setGridEnabled} />
          {gridEnabled && (
            <Field label={`Tamanho da célula: ${gridSize}px`}>
              <input
                type="range" min={16} max={256} step={8}
                value={gridSize}
                onChange={e => setGridSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-arcano)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                <span>16px</span><span>256px</span>
              </div>
            </Field>
          )}
        </div>

        <Field label={`Raio de visão padrão: ${defaultVisionRadius}px`}>
          <input
            type="range" min={50} max={2000} step={25}
            value={defaultVisionRadius}
            onChange={e => setDefaultVisionRadius(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-arcano)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            <span>50px</span><span>2000px</span>
          </div>
        </Field>

        <Field label={`Tamanho padrão dos tokens: ${defaultTokenSize.toFixed(2)}×`}>
          <input
            type="range" min={0.25} max={10} step={0.25}
            value={defaultTokenSize}
            onChange={e => setDefaultTokenSize(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-arcano)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            <span>0.25×</span><span>10×</span>
          </div>
        </Field>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onChange(!value)}
      onKeyDown={e => e.key === 'Enter' && onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.4rem 0.6rem', borderRadius: 4, cursor: 'pointer',
        background: value ? 'rgba(200,146,42,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${value ? 'rgba(200,146,42,0.3)' : 'rgba(255,255,255,0.08)'}`,
        userSelect: 'none',
      }}
    >
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: value ? 'var(--color-arcano)' : 'rgba(255,255,255,0.5)', flex: 1, paddingRight: '0.5rem' }}>
        {label}
      </span>
      <div style={{
        width: 32, height: 18, borderRadius: 9, position: 'relative', flexShrink: 0,
        background: value ? 'var(--color-arcano)' : 'rgba(255,255,255,0.15)',
        transition: 'background 0.15s',
      }}>
        <div style={{
          position: 'absolute', top: 2,
          left: value ? 16 : 2,
          width: 14, height: 14, borderRadius: '50%',
          background: 'white', transition: 'left 0.15s',
        }} />
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '0.55rem 0.75rem', borderRadius: 4,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.85rem',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '0.45rem 1rem', borderRadius: 4,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer',
}

const saveBtnStyle: React.CSSProperties = {
  padding: '0.45rem 1rem', borderRadius: 4,
  background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.4)',
  color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
}
