import { useEffect, useRef, useState } from 'react'
import { useCharacterRealtime } from '@/hooks/useCharacterRealtime'

interface CallParticipantTileProps {
  stream: MediaStream | null
  audioTrack: MediaStreamTrack | null
  displayName: string
  subtitle?: string
  image: string | null
  characterId: string | null
  hp: number | null
  maxHp: number | null
  defaultVolume?: number
}

export function CallParticipantTile({
  stream,
  audioTrack,
  displayName,
  subtitle,
  image,
  characterId,
  hp: initialHp,
  maxHp: initialMaxHp,
  defaultVolume = 1,
}: CallParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(defaultVolume)
  const [hp, setHp] = useState(initialHp)
  const [maxHp, setMaxHp] = useState(initialMaxHp)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioTrack) audioTrack.enabled = !muted
  }, [audioTrack, muted])

  // campaign.players already carries hp/currentHp for every member (roster-level
  // exposure, independent of a character's is_public flag) — that seeds this tile
  // on mount; useCharacterRealtime keeps current_hp live from then on.
  useCharacterRealtime(characterId ?? undefined, {
    onCharacterUpdate: data => {
      if ('current_hp' in data && data.current_hp != null) setHp(data.current_hp as number)
      if ('hp' in data && data.hp != null) setMaxHp(data.hp as number)
    },
    onStateUpdate: () => {},
    onInventoryChange: () => {},
  })

  const hpRatio = hp != null && maxHp != null && maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : null
  const hpColor = hpRatio == null ? 'rgba(255,255,255,0.3)' : hpRatio > 0.5 ? '#6FC892' : hpRatio > 0.2 ? '#E8B84B' : '#C05050'

  return (
    <div style={{
      position: 'relative', borderRadius: 6, overflow: 'hidden',
      background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)',
      aspectRatio: '16 / 9',
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#04060C', display: 'block' }}
      />

      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.3rem 0.55rem', borderRadius: 4,
        background: 'rgba(4,6,12,0.72)', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }}>
          {image && <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 700, color: '#EEF4FC',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName}{subtitle ? ` · ${subtitle}` : ''}
          </span>
          {hpRatio != null && (
            <div style={{ width: '100%', maxWidth: 100, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 3 }}>
              <div style={{ width: `${hpRatio * 100}%`, height: '100%', background: hpColor }} />
            </div>
          )}
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 8, left: 8, right: 8,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <button
          onClick={() => setMuted(v => !v)}
          title={muted ? 'Ativar áudio' : 'Silenciar'}
          style={{
            width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: muted ? 'rgba(200,60,60,0.75)' : 'rgba(4,6,12,0.72)', color: '#EEF4FC', fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--color-arcano)' }}
        />
      </div>
    </div>
  )
}
