import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/authContext'
import { useCampaignCallChannel } from '@/hooks/useCampaignCallChannel'
import type { CampaignDetail } from '@/data/campaignTypes'
import { CallParticipantTile } from './CallParticipantTile'

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.cloudflare.com:3478' }]

interface CallTabProps {
  campaign: CampaignDetail
}

interface RemoteParticipant {
  userId: string
  characterId: string | null
  stream: MediaStream
  audioTrack: MediaStreamTrack | null
}

function waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise(resolve => {
    function check() {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check)
        resolve()
      }
    }
    pc.addEventListener('icegatheringstatechange', check)
  })
}

export function CallTab({ campaign }: CallTabProps) {
  const { user } = useAuth()
  const [joined, setJoined] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null)
  const [participants, setParticipants] = useState<RemoteParticipant[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pullMidMapRef = useRef<Map<string, { userId: string; kind: 'audio' | 'video' }>>(new Map())
  const participantsRef = useRef<RemoteParticipant[]>([])
  const negotiationQueueRef = useRef<Promise<void>>(Promise.resolve())
  // PARTICIPANT_JOIN can arrive (via presence sync, for peers already in the
  // call) before our own RTCPeerConnection/session exist — buffer it here and
  // drain once joinCall() finishes setting those up, instead of dropping it.
  const pendingJoinsRef = useRef<Map<string, { characterId: string | null; cloudflareSessionId: string }>>(new Map())
  // Cloudflare Realtime only accepts a track pull once it already knows this
  // session's SDP (from our own push negotiation) — pulling any earlier fails
  // server-side, so this only flips true once the push round-trip is done.
  const pushReadyRef = useRef(false)
  participantsRef.current = participants

  const selfCharacter = campaign.players.find(p => p.userId === user?.id) ?? null

  function enqueueNegotiation<T>(fn: () => Promise<T>): Promise<T> {
    const result = negotiationQueueRef.current.then(fn, fn)
    negotiationQueueRef.current = result.then(() => undefined, () => undefined)
    return result
  }

  const pullParticipant = useCallback(async (userId: string, characterId: string | null, remoteSessionId: string) => {
    const pc = pcRef.current
    const mySessionId = sessionIdRef.current
    if (!pc || !mySessionId || !pushReadyRef.current) return
    if (participantsRef.current.some(p => p.userId === userId)) return

    const stream = new MediaStream()
    setParticipants(prev => [...prev, { userId, characterId, stream, audioTrack: null }])

    try {
      await enqueueNegotiation(async () => {
        const resp = await api.calls.negotiateTracks(campaign.id, mySessionId, {
          tracks: [
            { location: 'remote', sessionId: remoteSessionId, trackName: `${remoteSessionId}-audio` },
            { location: 'remote', sessionId: remoteSessionId, trackName: `${remoteSessionId}-video` },
          ],
        })
        for (const t of resp.tracks ?? []) {
          if (!t.mid) continue
          const kind: 'audio' | 'video' = t.trackName.endsWith('-audio') ? 'audio' : 'video'
          pullMidMapRef.current.set(t.mid, { userId, kind })
        }
        if (resp.requiresImmediateRenegotiation && resp.sessionDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(resp.sessionDescription))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          if (answer.sdp) await api.calls.renegotiate(campaign.id, mySessionId, { sdp: answer.sdp, type: 'answer' })
        }
      })
    } catch {
      setParticipants(prev => prev.filter(p => p.userId !== userId))
    }
  }, [campaign.id])

  const broadcast = useCampaignCallChannel(campaign.id, {
    selfId: user?.id,
    onParticipantJoin: (userId, characterId, cloudflareSessionId) => {
      pendingJoinsRef.current.set(userId, { characterId, cloudflareSessionId })
      if (pushReadyRef.current) void pullParticipant(userId, characterId, cloudflareSessionId)
    },
    onParticipantLeave: userId => {
      pendingJoinsRef.current.delete(userId)
      setParticipants(prev => prev.filter(p => p.userId !== userId))
    },
  })

  function stopLocalMedia() {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null
    setLocalStream(null)
    setLocalAudioTrack(null)
  }

  const joinCall = useCallback(async () => {
    if (!user) return
    setConnecting(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      localStreamRef.current = stream
      setLocalStream(stream)
      setLocalAudioTrack(stream.getAudioTracks()[0] ?? null)

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, bundlePolicy: 'max-bundle' })
      pcRef.current = pc

      pc.ontrack = event => {
        const mid = event.transceiver.mid
        const info = mid ? pullMidMapRef.current.get(mid) : undefined
        if (!info) return
        setParticipants(prev => prev.map(p => {
          if (p.userId !== info.userId) return p
          p.stream.addTrack(event.track)
          return info.kind === 'audio' ? { ...p, audioTrack: event.track } : { ...p }
        }))
      }

      const { sessionId } = await api.calls.createSession(campaign.id)
      sessionIdRef.current = sessionId

      const audioTrack = stream.getAudioTracks()[0]
      const videoTrack = stream.getVideoTracks()[0]
      const audioTransceiver = pc.addTransceiver(audioTrack, { direction: 'sendonly' })
      const videoTransceiver = pc.addTransceiver(videoTrack, { direction: 'sendonly' })

      await pc.setLocalDescription(await pc.createOffer())
      await waitForIceGatheringComplete(pc)
      const localDesc = pc.localDescription
      if (!localDesc?.sdp) throw new Error('Falha ao negociar a conexão de vídeo')

      const pushResp = await enqueueNegotiation(() => api.calls.negotiateTracks(campaign.id, sessionId, {
        sessionDescription: { sdp: localDesc.sdp, type: 'offer' },
        tracks: [
          { location: 'local', mid: audioTransceiver.mid ?? undefined, trackName: `${sessionId}-audio`, kind: 'audio' },
          { location: 'local', mid: videoTransceiver.mid ?? undefined, trackName: `${sessionId}-video`, kind: 'video' },
        ],
      }))
      if (pushResp.sessionDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(pushResp.sessionDescription))
      }
      pushReadyRef.current = true

      broadcast({
        type: 'PARTICIPANT_JOIN',
        userId: user.id,
        characterId: selfCharacter?.id ?? null,
        cloudflareSessionId: sessionId,
      })
      setJoined(true)

      for (const [pendingUserId, info] of pendingJoinsRef.current) {
        void pullParticipant(pendingUserId, info.characterId, info.cloudflareSessionId)
      }
    } catch (err) {
      setError((err as Error).message || 'Não foi possível iniciar a chamada')
      pushReadyRef.current = false
      pcRef.current?.close()
      pcRef.current = null
      stopLocalMedia()
    } finally {
      setConnecting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.id, user, selfCharacter, broadcast])

  const leaveCall = useCallback(() => {
    if (user) broadcast({ type: 'PARTICIPANT_LEAVE', userId: user.id })
    pcRef.current?.close()
    pcRef.current = null
    pushReadyRef.current = false
    stopLocalMedia()
    setParticipants([])
    sessionIdRef.current = null
    pullMidMapRef.current.clear()
    pendingJoinsRef.current.clear()
    setJoined(false)
  }, [broadcast, user])

  useEffect(() => {
    return () => {
      pcRef.current?.close()
      localStreamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  return (
    <div style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#EEF4FC' }}>Chamada de Sessão</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Vídeo e áudio ao vivo entre os participantes desta campanha.
            </p>
          </div>
          {!joined ? (
            <button
              onClick={() => void joinCall()}
              disabled={connecting}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: 4,
                background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.4)',
                color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)', fontWeight: 700,
                fontSize: '0.8rem', cursor: connecting ? 'default' : 'pointer', opacity: connecting ? 0.6 : 1,
              }}
            >
              {connecting ? 'Conectando…' : 'Entrar na chamada'}
            </button>
          ) : (
            <button
              onClick={leaveCall}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: 4,
                background: 'rgba(200,60,60,0.12)', border: '1px solid rgba(200,60,60,0.35)',
                color: 'rgba(220,100,100,0.85)', fontFamily: 'var(--font-ui)', fontWeight: 700,
                fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              Sair da chamada
            </button>
          )}
        </div>

        {error && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: '#C05050',
            background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.25)',
            borderRadius: 4, padding: '0.65rem 0.9rem', marginBottom: '1.25rem',
          }}>
            {error}
          </p>
        )}

        {!joined ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Ao entrar, o navegador vai pedir permissão de câmera e microfone.
          </p>
        ) : (
          <div style={{
            display: 'grid', gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          }}>
            <CallParticipantTile
              stream={localStream}
              audioTrack={localAudioTrack}
              displayName={selfCharacter?.name ?? 'Você'}
              subtitle={selfCharacter ? 'Você' : undefined}
              image={selfCharacter?.imageUrl ?? null}
              characterId={selfCharacter?.id ?? null}
              hp={selfCharacter ? (selfCharacter.currentHp ?? selfCharacter.hp) : null}
              maxHp={selfCharacter?.hp ?? null}
              defaultVolume={0}
            />
            {participants.map(p => {
              const char = campaign.players.find(pl => pl.id === p.characterId)
              const isGmParticipant = campaign.gmUserId === p.userId
              return (
                <CallParticipantTile
                  key={p.userId}
                  stream={p.stream}
                  audioTrack={p.audioTrack}
                  displayName={char?.name ?? (isGmParticipant ? 'Mestre' : 'Participante')}
                  image={char?.imageUrl ?? null}
                  characterId={p.characterId}
                  hp={char ? (char.currentHp ?? char.hp) : null}
                  maxHp={char?.hp ?? null}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
