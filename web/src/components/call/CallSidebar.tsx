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
}

export function CallSidebar({
  rows,
  viewerIsGm,
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
}: CallSidebarProps) {
  return (
    <div style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6, overflow: 'hidden', alignSelf: 'flex-start',
    }}>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--color-text-muted)', padding: '0.75rem 0.9rem 0.5rem',
      }}>
        Participantes
      </p>

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

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto' }}>
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
      </div>
    </div>
  )
}
