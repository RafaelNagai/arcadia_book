import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { MapTool } from '@/lib/mapTypes'

interface MapToolbarProps {
  tool: MapTool
  onToolChange: (t: MapTool) => void
  fogEnabled: boolean
  onFogToggle: () => void
  onFogReset: () => void
  onBackToGallery: () => void
  onSettings: () => void
  onFocusAll?: () => void
  onMeasurementClearAll?: () => void
  hasMeasurements?: boolean
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.35rem 0.75rem', borderRadius: 4,
  fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
  cursor: 'pointer', whiteSpace: 'nowrap',
}

const dropdownPanelBase: React.CSSProperties = {
  zIndex: 9999,
  background: 'rgba(8,12,28,0.98)', border: '1px solid var(--color-border)',
  borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
  backdropFilter: 'blur(12px)',
  minWidth: 160,
  overflow: 'hidden',
}

// ── DropdownGroup ─────────────────────────────────────────────────────────────
// Generic dropdown: renders a trigger button + a floating panel.
// Children is a render-prop that receives a `close()` callback.

interface DropdownGroupProps {
  icon: string
  label: string
  isActive?: boolean
  activeColor?: string
  activeBorderColor?: string
  activeTextColor?: string
  children: (close: () => void) => React.ReactNode
}

function DropdownGroup({
  icon, label, isActive = false,
  activeColor = 'rgba(200,146,42,0.18)',
  activeBorderColor = 'rgba(200,146,42,0.5)',
  activeTextColor = 'var(--color-arcano)',
  children,
}: DropdownGroupProps) {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  const handleToggle = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPanelPos({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen(v => !v)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const inTrigger = triggerRef.current?.contains(e.target as Node)
      const inPanel = panelRef.current?.contains(e.target as Node)
      if (!inTrigger && !inPanel) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          ...btnBase,
          background: (isActive || open) ? activeColor : 'rgba(255,255,255,0.04)',
          border: `1px solid ${(isActive || open) ? activeBorderColor : 'rgba(255,255,255,0.1)'}`,
          color: (isActive || open) ? activeTextColor : 'var(--color-text-muted)',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.55, marginLeft: 1 }}>▾</span>
      </button>

      {open && panelPos && createPortal(
        <div
          ref={panelRef}
          style={{ ...dropdownPanelBase, position: 'fixed', top: panelPos.top, left: panelPos.left }}
        >
          {children(close)}
        </div>,
        document.body,
      )}
    </div>
  )
}

// ── DropdownItem ──────────────────────────────────────────────────────────────

function DropdownItem({
  icon, label, active = false, onClick,
  activeColor = 'rgba(200,146,42,0.12)',
  activeBorderColor = 'transparent',
  activeTextColor = 'var(--color-arcano)',
  danger = false,
}: {
  icon: string
  label: string
  active?: boolean
  onClick: () => void
  activeColor?: string
  activeBorderColor?: string
  activeTextColor?: string
  danger?: boolean
}) {
  const color = danger
    ? 'rgba(232,80,48,0.85)'
    : active ? activeTextColor : 'rgba(255,255,255,0.65)'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        width: '100%', padding: '0.5rem 0.85rem',
        background: active ? activeColor : 'transparent',
        borderLeft: `2px solid ${active ? activeBorderColor : 'transparent'}`,
        border: 'none', borderRadius: 0,
        color, fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: active ? 600 : 400,
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = active ? activeColor : 'transparent'
      }}
    >
      <span style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}>{icon}</span>
      {label}
    </button>
  )
}

// ── DropdownDivider ───────────────────────────────────────────────────────────

function DropdownDivider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.2rem 0' }} />
}

// ── DropdownToggle ────────────────────────────────────────────────────────────

function DropdownToggle({ icon, label, value, onChange }: {
  icon: string; label: string; value: boolean; onChange: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onChange}
      onKeyDown={e => e.key === 'Enter' && onChange()}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        width: '100%', padding: '0.5rem 0.85rem',
        cursor: 'pointer',
        background: value ? 'rgba(80,200,232,0.1)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!value) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = value ? 'rgba(80,200,232,0.1)' : 'transparent'
      }}
    >
      <span style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.78rem',
        color: value ? '#50C8E8' : 'rgba(255,255,255,0.65)',
        flex: 1,
      }}>
        {label}
      </span>
      {/* mini pill badge */}
      <span style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em',
        padding: '1px 5px', borderRadius: 99,
        background: value ? 'rgba(80,200,232,0.2)' : 'rgba(255,255,255,0.08)',
        color: value ? '#50C8E8' : 'rgba(255,255,255,0.3)',
        border: `1px solid ${value ? 'rgba(80,200,232,0.3)' : 'rgba(255,255,255,0.1)'}`,
      }}>
        {value ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

// ── Separator ─────────────────────────────────────────────────────────────────

const sep = <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 0.15rem', flexShrink: 0 }} />

// ── MapToolbar ────────────────────────────────────────────────────────────────

export function MapToolbar({
  tool, onToolChange, fogEnabled, onFogToggle, onFogReset,
  onBackToGallery, onSettings, onFocusAll, onMeasurementClearAll, hasMeasurements,
}: MapToolbarProps) {
  const isStructure = tool === 'wall' || tool === 'door'
  const isMeasure   = tool === 'ruler' || tool === 'circle'
  const isFogTool   = tool === 'fog'

  // Label for active sub-tool within each group
  const structureLabel = tool === 'wall' ? 'Muro' : tool === 'door' ? 'Porta' : 'Estrutura'
  const structureIcon  = tool === 'wall' ? '⬛' : tool === 'door' ? '🚪' : '🧱'
  const measureLabel   = tool === 'ruler' ? 'Régua' : tool === 'circle' ? 'Área' : 'Medição'
  const measureIcon    = tool === 'ruler' ? '📏' : tool === 'circle' ? '⭕' : '📐'
  const fogLabel       = isFogTool ? 'Revelar' : fogEnabled ? 'Névoa ON' : 'Névoa'
  const fogIcon        = isFogTool ? '👁' : '🌫'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.5rem 0.75rem',
      background: 'rgba(4,6,12,0.92)',
      borderBottom: '1px solid var(--color-border)',
      backdropFilter: 'blur(8px)',
      flexWrap: 'wrap',
    }}>
      {/* Mover — standalone */}
      <button
        title="Mover / selecionar"
        onClick={() => onToolChange('select')}
        style={{
          ...btnBase,
          background: tool === 'select' ? 'rgba(200,146,42,0.18)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${tool === 'select' ? 'rgba(200,146,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: tool === 'select' ? 'var(--color-arcano)' : 'var(--color-text-muted)',
        }}
      >
        <span style={{ fontSize: '1rem' }}>✥</span>
        <span className="hidden sm:inline">Mover</span>
      </button>

      {sep}

      {/* Estrutura group: Muro + Porta */}
      <DropdownGroup
        icon={structureIcon}
        label={structureLabel}
        isActive={isStructure}
      >
        {close => (
          <>
            <DropdownItem
              icon="⬛" label="Muro"
              active={tool === 'wall'}
              activeColor="rgba(200,146,42,0.12)"
              activeBorderColor="rgba(200,146,42,0.5)"
              activeTextColor="var(--color-arcano)"
              onClick={() => { onToolChange('wall'); close() }}
            />
            <DropdownItem
              icon="🚪" label="Porta"
              active={tool === 'door'}
              activeColor="rgba(200,146,42,0.12)"
              activeBorderColor="rgba(200,146,42,0.5)"
              activeTextColor="var(--color-arcano)"
              onClick={() => { onToolChange('door'); close() }}
            />
          </>
        )}
      </DropdownGroup>

      {/* Medição group: Régua + Área + Limpar */}
      <DropdownGroup
        icon={measureIcon}
        label={measureLabel}
        isActive={isMeasure}
        activeColor="rgba(80,200,232,0.18)"
        activeBorderColor="rgba(80,200,232,0.5)"
        activeTextColor="#50C8E8"
      >
        {close => (
          <>
            <DropdownItem
              icon="📏" label="Régua"
              active={tool === 'ruler'}
              activeColor="rgba(80,200,232,0.12)"
              activeBorderColor="rgba(80,200,232,0.5)"
              activeTextColor="#50C8E8"
              onClick={() => { onToolChange('ruler'); close() }}
            />
            <DropdownItem
              icon="⭕" label="Área (círculo)"
              active={tool === 'circle'}
              activeColor="rgba(80,200,232,0.12)"
              activeBorderColor="rgba(80,200,232,0.5)"
              activeTextColor="#50C8E8"
              onClick={() => { onToolChange('circle'); close() }}
            />
            {hasMeasurements && onMeasurementClearAll && (
              <>
                <DropdownDivider />
                <DropdownItem
                  icon="✕" label="Limpar medições"
                  danger
                  onClick={() => { onMeasurementClearAll(); close() }}
                />
              </>
            )}
          </>
        )}
      </DropdownGroup>

      {sep}

      {/* Névoa group: Névoa ON/OFF + Revelar + Reset */}
      <DropdownGroup
        icon={fogIcon}
        label={fogLabel}
        isActive={isFogTool || fogEnabled}
        activeColor={isFogTool ? 'rgba(200,146,42,0.18)' : 'rgba(80,200,232,0.15)'}
        activeBorderColor={isFogTool ? 'rgba(200,146,42,0.5)' : 'rgba(80,200,232,0.4)'}
        activeTextColor={isFogTool ? 'var(--color-arcano)' : '#50C8E8'}
      >
        {close => (
          <>
            <DropdownToggle
              icon="🌫" label="Névoa de guerra"
              value={fogEnabled}
              onChange={onFogToggle}
            />
            <DropdownDivider />
            <DropdownItem
              icon="👁" label="Revelar área"
              active={tool === 'fog'}
              activeColor="rgba(200,146,42,0.12)"
              activeBorderColor="rgba(200,146,42,0.5)"
              activeTextColor="var(--color-arcano)"
              onClick={() => { onToolChange('fog'); close() }}
            />
            {fogEnabled && (
              <>
                <DropdownDivider />
                <DropdownItem
                  icon="↺" label="Reset névoa"
                  danger
                  onClick={() => { onFogReset(); close() }}
                />
              </>
            )}
          </>
        )}
      </DropdownGroup>

      {/* Right-side controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {sep}

        {onFocusAll && (
          <button
            title="Chamar todos para esta tela"
            onClick={onFocusAll}
            style={{ ...btnBase, background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.35)', color: 'var(--color-arcano)' }}
          >
            <span style={{ fontSize: '0.9rem' }}>📍</span>
            <span className="hidden md:inline">Chamar todos</span>
          </button>
        )}

        <button
          title="Configurações do mapa"
          onClick={onSettings}
          style={{ ...btnBase, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}
        >
          <span style={{ fontSize: '0.9rem' }}>⚙</span>
          <span className="hidden md:inline">Config</span>
        </button>

        <button
          title="Voltar à galeria de mapas"
          onClick={onBackToGallery}
          style={{ ...btnBase, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}
        >
          <span style={{ fontSize: '0.85rem' }}>←</span>
          <span className="hidden md:inline">Mapas</span>
        </button>
      </div>
    </div>
  )
}
