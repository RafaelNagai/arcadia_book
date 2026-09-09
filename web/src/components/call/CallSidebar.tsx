import { useEffect, useRef, useState } from 'react'
import type { LayoutMode } from '@/hooks/useCampaignCallChannel'

const METER_MIN_DB = -70
const METER_MAX_DB = 0

function dbToPercent(db: number) {
  const clamped = Math.min(METER_MAX_DB, Math.max(METER_MIN_DB, db))
  return ((clamped - METER_MIN_DB) / (METER_MAX_DB - METER_MIN_DB)) * 100
}

export interface CallSidebarRow {
  userId: string
  accountName: string
  characterName: string
  isGm: boolean
  isSelf: boolean
  muted: boolean
  volume: number
  cameraEnabled: boolean
}

interface DeviceSelectProps {
  label: string
  devices: MediaDeviceInfo[]
  selected: string
  fallbackLabel: string
  onChange: (deviceId: string) => void
}

function DeviceSelect({ label, devices, selected, fallbackLabel, onChange }: DeviceSelectProps) {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--color-text-muted)', marginBottom: '0.3rem',
      }}>
        {label}
      </p>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '0.4rem 0.5rem', borderRadius: 4,
          background: 'rgba(4,6,12,0.72)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
        }}
      >
        {devices.length === 0 && <option value="">{fallbackLabel}</option>}
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>{d.label || `${fallbackLabel} ${i + 1}`}</option>
        ))}
      </select>
    </div>
  )
}

interface CallSidebarProps {
  rows: CallSidebarRow[]
  viewerIsGm: boolean
  activeLayoutMode: LayoutMode
  onChangeLayoutMode: (mode: LayoutMode) => void
  onToggleMute: (userId: string) => void
  onVolumeChange: (userId: string, value: number) => void
  onForceMuteAll: (userId: string) => void
  onToggleCamera: () => void
  audioInputs: MediaDeviceInfo[]
  videoInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  selectedAudioInput: string
  selectedVideoInput: string
  selectedAudioOutput: string
  onAudioInputChange: (deviceId: string) => void
  onVideoInputChange: (deviceId: string) => void
  onAudioOutputChange: (deviceId: string) => void
  noiseGateThresholdDb: number
  onNoiseGateThresholdChange: (db: number) => void
  getMicLevelDb: () => number
}

function MicLevelMeter({ thresholdDb, onThresholdChange, getLevelDb }: {
  thresholdDb: number
  onThresholdChange: (db: number) => void
  getLevelDb: () => number
}) {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number
    function tick() {
      if (fillRef.current) fillRef.current.style.width = `${dbToPercent(getLevelDb())}%`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [getLevelDb])

  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--color-text-muted)', marginBottom: '0.3rem',
      }}>
        Gate de ruído — corta abaixo de {thresholdDb.toFixed(0)} dB
      </p>
      <div style={{ position: 'relative', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div ref={fillRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: 'rgba(111,200,146,0.55)' }} />
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: 2,
          left: `${dbToPercent(thresholdDb)}%`, background: 'var(--color-arcano)',
        }} />
      </div>
      <input
        type="range"
        min={METER_MIN_DB}
        max={METER_MAX_DB}
        step={1}
        value={thresholdDb}
        onChange={e => onThresholdChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--color-arcano)', marginTop: '0.35rem' }}
      />
    </div>
  )
}

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        padding: '0.75rem 0.9rem 0.5rem',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
      }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{open ? '−' : '+'}</span>
    </button>
  )
}

function LayoutModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '0.4rem 0.5rem', borderRadius: 4, cursor: 'pointer',
        border: active ? '1px solid rgba(200,146,42,0.5)' : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'rgba(200,146,42,0.18)' : 'rgba(4,6,12,0.72)',
        color: active ? 'var(--color-arcano)' : '#EEF4FC',
        fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  )
}

export function CallSidebar({
  rows,
  viewerIsGm,
  activeLayoutMode,
  onChangeLayoutMode,
  onToggleMute,
  onVolumeChange,
  onForceMuteAll,
  onToggleCamera,
  audioInputs,
  videoInputs,
  audioOutputs,
  selectedAudioInput,
  selectedVideoInput,
  selectedAudioOutput,
  onAudioInputChange,
  onVideoInputChange,
  onAudioOutputChange,
  noiseGateThresholdDb,
  onNoiseGateThresholdChange,
  getMicLevelDb,
}: CallSidebarProps) {
  const [participantsOpen, setParticipantsOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6, overflow: 'hidden', alignSelf: 'flex-start',
    }}>
      {viewerIsGm && (
        <div style={{ padding: '0.75rem 0.9rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)', marginBottom: '0.4rem',
          }}>
            Modo de exibição
          </p>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <LayoutModeButton label="Destaque no mestre" active={activeLayoutMode === 'spotlight'} onClick={() => onChangeLayoutMode('spotlight')} />
            <LayoutModeButton label="Grade igual" active={activeLayoutMode === 'gallery'} onClick={() => onChangeLayoutMode('gallery')} />
          </div>
        </div>
      )}

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <SectionHeader label="Participantes" open={participantsOpen} onToggle={() => setParticipantsOpen(v => !v)} />

        {participantsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 0.75rem 0.75rem' }}>
            {rows.map(row => (
              <div key={row.userId} style={{
                display: 'flex', flexDirection: 'column', gap: '0.35rem',
                padding: '0.5rem 0.6rem', borderRadius: 4, background: 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, color: '#EEF4FC',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.accountName}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {row.characterName}{row.isGm ? ' · Mestre' : ''}
                    </p>
                  </div>

                  {row.isSelf && (
                    <button
                      onClick={onToggleCamera}
                      title={row.cameraEnabled ? 'Desligar câmera' : 'Ligar câmera'}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: row.cameraEnabled ? 'rgba(4,6,12,0.72)' : 'rgba(200,60,60,0.75)', color: '#EEF4FC', fontSize: '0.7rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {row.cameraEnabled ? '📷' : '🚫'}
                    </button>
                  )}

                  <button
                    onClick={() => onToggleMute(row.userId)}
                    title={row.muted ? 'Ativar áudio' : 'Silenciar só para mim'}
                    style={{
                      width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: row.muted ? 'rgba(200,60,60,0.75)' : 'rgba(4,6,12,0.72)', color: '#EEF4FC', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {row.muted ? '🔇' : '🔊'}
                  </button>

                  {viewerIsGm && !row.isGm && (
                    <button
                      onClick={() => onForceMuteAll(row.userId)}
                      title="Mutar para todos"
                      style={{
                        width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                        background: 'rgba(4,6,12,0.72)', color: 'var(--color-arcano)', fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      🔨
                    </button>
                  )}
                </div>

                {!row.isSelf && (
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={row.volume}
                    onChange={e => onVolumeChange(row.userId, Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-arcano)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader label="Configurações" open={settingsOpen} onToggle={() => setSettingsOpen(v => !v)} />

        {settingsOpen && (
          <div style={{ padding: '0 0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <DeviceSelect
              label="Saída de áudio"
              devices={audioOutputs}
              selected={selectedAudioOutput}
              fallbackLabel="Saída"
              onChange={onAudioOutputChange}
            />
            <DeviceSelect
              label="Microfone"
              devices={audioInputs}
              selected={selectedAudioInput}
              fallbackLabel="Microfone"
              onChange={onAudioInputChange}
            />
            <DeviceSelect
              label="Câmera"
              devices={videoInputs}
              selected={selectedVideoInput}
              fallbackLabel="Câmera"
              onChange={onVideoInputChange}
            />
            <MicLevelMeter
              thresholdDb={noiseGateThresholdDb}
              onThresholdChange={onNoiseGateThresholdChange}
              getLevelDb={getMicLevelDb}
            />
          </div>
        )}
      </div>
    </div>
  )
}
