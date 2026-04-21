import type { MapTool } from '@/lib/mapTypes'

interface MapToolbarProps {
  tool: MapTool
  onToolChange: (t: MapTool) => void
  fogEnabled: boolean
  onFogToggle: () => void
  onFogReset: () => void
}

const TOOLS: { id: MapTool; label: string; icon: string }[] = [
  { id: 'select', label: 'Mover mapa',   icon: '✥' },
  { id: 'move',   label: 'Mover token',  icon: '⊕' },
  { id: 'fog',    label: 'Revelar névoa', icon: '👁' },
]

export function MapToolbar({ tool, onToolChange, fogEnabled, onFogToggle, onFogReset }: MapToolbarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      background: 'rgba(4,6,12,0.92)',
      borderBottom: '1px solid var(--color-border)',
      backdropFilter: 'blur(8px)',
    }}>
      {TOOLS.map(t => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => onToolChange(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.75rem', borderRadius: 4,
            background: tool === t.id ? 'rgba(200,146,42,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${tool === t.id ? 'rgba(200,146,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: tool === t.id ? 'var(--color-arcano)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 0.25rem' }} />

      {/* Fog toggle */}
      <button
        title={fogEnabled ? 'Desativar névoa' : 'Ativar névoa'}
        onClick={onFogToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem', borderRadius: 4,
          background: fogEnabled ? 'rgba(80,200,232,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${fogEnabled ? 'rgba(80,200,232,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color: fogEnabled ? '#50C8E8' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🌫</span>
        <span className="hidden sm:inline">{fogEnabled ? 'Névoa ON' : 'Névoa OFF'}</span>
      </button>

      {/* Fog reset */}
      {fogEnabled && (
        <button
          title="Resetar névoa (limpar revelações manuais)"
          onClick={onFogReset}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.75rem', borderRadius: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '1rem' }}>↺</span>
          <span className="hidden sm:inline">Reset névoa</span>
        </button>
      )}
    </div>
  )
}
