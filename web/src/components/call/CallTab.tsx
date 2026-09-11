import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, ApiError } from '@/lib/apiClient'
import { useAuth } from '@/lib/authContext'
import { useCampaignCallChannel, type LayoutMode } from '@/hooks/useCampaignCallChannel'
import { useGalleryLayout, GALLERY_GAP } from '@/hooks/useGalleryLayout'
import { createNoiseGate, type NoiseGate } from '@/lib/noiseGate'
import type { CampaignDetail } from '@/data/campaignTypes'
import { CallParticipantTile } from './CallParticipantTile'
import { CallSidebar } from './CallSidebar'
import {
  getMasterWrapperStyle,
  getOtherTileClassName,
  getOthersWrapperClassName,
  getOthersWrapperStyle,
  getTileWrapperStyle,
  isSpotlightActive,
} from './CallSpotlightGrid'
import type { CallTileData } from './callTypes'

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.cloudflare.com:3478' }]
const ICE_GATHERING_TIMEOUT_MS = 8_000
const NEGOTIATION_TIMEOUT_MS = 12_000
const CONNECTION_TIMEOUT_MESSAGE = 'Não foi possível estabelecer a conexão de vídeo — verifique sua rede'
const PULL_RETRY_MAX_ATTEMPTS = 3
const PULL_RETRY_BASE_DELAY_MS = 600
// Cloudflare Realtime cobra por GB relayado pelo SFU (bitrate × duração ×
// participantes) — 360p/18-24fps é o suficiente para reconhecer rosto numa
// call de RPG (talking heads) e mantém o custo baixo sem travar/pixelizar.
const VIDEO_CAPTURE_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640, max: 640 },
  height: { ideal: 360, max: 360 },
  frameRate: { ideal: 18, max: 24 },
}
const VIDEO_SEND_ENCODINGS: RTCRtpEncodingParameters[] = [{ maxBitrate: 400_000, maxFramerate: 24 }]

interface CallTabProps {
  campaign: CampaignDetail
}

interface RemoteParticipant {
  userId: string
  characterId: string | null
  accountName: string
  cameraEnabled: boolean
  layoutMode: LayoutMode | null
  stream: MediaStream
  audioTrack: MediaStreamTrack | null
}

interface RowState {
  muted: boolean
  volume: number
}

// Resolve (never reject) once gathering completes, or after `timeoutMs` —
// whichever comes first. Some networks (CGNAT, restrictive mobile carriers)
// never reach 'complete', so we proceed with whatever candidates were
// collected by the deadline instead of hanging forever; the offer sent to
// the backend still works with a partial candidate set.
function waitForIceGatheringComplete(pc: RTCPeerConnection, timeoutMs = ICE_GATHERING_TIMEOUT_MS): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pc.removeEventListener('icegatheringstatechange', check)
      resolve()
    }, timeoutMs)
    function check() {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timer)
        pc.removeEventListener('icegatheringstatechange', check)
        resolve()
      }
    }
    pc.addEventListener('icegatheringstatechange', check)
  })
}

function rejectAfter(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
}

export function CallTab({ campaign }: CallTabProps) {
  const { user } = useAuth()
  const [joined, setJoined] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [participants, setParticipants] = useState<RemoteParticipant[]>([])
  const [rowState, setRowState] = useState<Record<string, RowState>>({})
  const [gmPresent, setGmPresent] = useState(false)
  const [waitingForGm, setWaitingForGm] = useState(false)
  const [kickedByGm, setKickedByGm] = useState(false)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('gallery')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [noiseGateThresholdDb, setNoiseGateThresholdDb] = useState(-70)

  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([])
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([])
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState('')
  const [selectedVideoInput, setSelectedVideoInput] = useState('')
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('')

  const isGm = user?.id === campaign.gmUserId

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioTransceiverRef = useRef<RTCRtpTransceiver | null>(null)
  const videoTransceiverRef = useRef<RTCRtpTransceiver | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const noiseGateRef = useRef<NoiseGate | null>(null)
  const rawAudioTrackRef = useRef<MediaStreamTrack | null>(null)
  const pullMidMapRef = useRef<Map<string, { userId: string; kind: 'audio' | 'video' }>>(new Map())
  const participantsRef = useRef<RemoteParticipant[]>([])
  const negotiationQueueRef = useRef<Promise<void>>(Promise.resolve())
  // PARTICIPANT_JOIN can arrive (via presence sync, for peers already in the
  // call) before our own RTCPeerConnection/session exist — buffer it here and
  // drain once joinCall() finishes setting those up, instead of dropping it.
  const pendingJoinsRef = useRef<Map<string, { characterId: string | null; cloudflareSessionId: string; accountName: string; cameraEnabled: boolean; layoutMode: LayoutMode | null }>>(new Map())
  // Cloudflare Realtime only accepts a track pull once it already knows this
  // session's SDP (from our own push negotiation) — pulling any earlier fails
  // server-side, so this only flips true once the push round-trip is done.
  const pushReadyRef = useRef(false)
  participantsRef.current = participants

  const selfCharacter = campaign.players.find(p => p.userId === user?.id) ?? null

  const accountName = (user?.user_metadata?.full_name as string | undefined)
    ?? (user?.user_metadata?.name as string | undefined)
    ?? (user?.user_metadata?.custom_claims?.global_name as string | undefined)
    ?? user?.email
    ?? 'Jogador'

  function enqueueNegotiation<T>(fn: () => Promise<T>): Promise<T> {
    const result = negotiationQueueRef.current.then(fn, fn)
    negotiationQueueRef.current = result.then(() => undefined, () => undefined)
    return result
  }

  const ensureRowState = useCallback((userId: string, defaultVolume: number) => {
    setRowState(prev => (prev[userId] ? prev : { ...prev, [userId]: { muted: false, volume: defaultVolume } }))
  }, [])

  const handleToggleMute = useCallback((userId: string) => {
    setRowState(prev => ({ ...prev, [userId]: { muted: !(prev[userId]?.muted ?? false), volume: prev[userId]?.volume ?? 1 } }))
  }, [])

  const handleVolumeChange = useCallback((userId: string, value: number) => {
    setRowState(prev => ({ ...prev, [userId]: { muted: prev[userId]?.muted ?? false, volume: value } }))
  }, [])

  const pullParticipant = useCallback(async (
    userId: string,
    characterId: string | null,
    remoteSessionId: string,
    accountName: string,
    cameraEnabled: boolean,
    layoutMode: LayoutMode | null,
  ) => {
    const pc = pcRef.current
    const mySessionId = sessionIdRef.current
    if (!pc || !mySessionId || !pushReadyRef.current) return
    if (participantsRef.current.some(p => p.userId === userId)) return

    const stream = new MediaStream()
    setParticipants(prev => [...prev, { userId, characterId, accountName, cameraEnabled, layoutMode, stream, audioTrack: null }])
    ensureRowState(userId, 1)

    let lastError: unknown = null
    for (let attempt = 1; attempt <= PULL_RETRY_MAX_ATTEMPTS; attempt++) {
      // Sessão pode ter sido encerrada (leaveCall/disconnect) entre tentativas
      // de retry — aborta silenciosamente em vez de tratar como falha real.
      if (pcRef.current !== pc || sessionIdRef.current !== mySessionId) return
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
        return
      } catch (err) {
        lastError = err
        console.debug('[call:pull] negotiateTracks failed, retrying', { userId, attempt, error: err })
        if (attempt < PULL_RETRY_MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, PULL_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)))
        }
      }
    }

    if (pcRef.current !== pc || sessionIdRef.current !== mySessionId) return
    console.error('[call:pull] all retries exhausted, giving up on participant', { userId, attempts: PULL_RETRY_MAX_ATTEMPTS, error: lastError })
    setParticipants(prev => prev.filter(p => p.userId !== userId))
  }, [campaign.id, ensureRowState])

  const broadcast = useCampaignCallChannel(campaign.id, {
    selfId: user?.id,
    onParticipantUpdate: (userId, characterId, cloudflareSessionId, accountName, cameraEnabled, layoutMode) => {
      // DEBUG(call-kick-regression): see useCampaignCallChannel.ts top-of-file note.
      console.debug('[call:presence] onParticipantUpdate called', { userId, isGmUser: userId === campaign.gmUserId })
      if (userId === campaign.gmUserId) setGmPresent(true)
      pendingJoinsRef.current.set(userId, { characterId, cloudflareSessionId, accountName, cameraEnabled, layoutMode })
      if (participantsRef.current.some(p => p.userId === userId)) {
        setParticipants(prev => prev.map(p => (p.userId === userId ? { ...p, characterId, accountName, cameraEnabled, layoutMode } : p)))
      } else if (pushReadyRef.current) {
        void pullParticipant(userId, characterId, cloudflareSessionId, accountName, cameraEnabled, layoutMode)
      }
    },
    onParticipantLeave: userId => {
      // DEBUG(call-kick-regression): see useCampaignCallChannel.ts top-of-file note.
      console.debug('[call:presence] onParticipantLeave called', { userId, isGmUser: userId === campaign.gmUserId })
      if (userId === campaign.gmUserId) setGmPresent(false)
      pendingJoinsRef.current.delete(userId)
      setParticipants(prev => prev.filter(p => p.userId !== userId))
      setRowState(prev => {
        if (!(userId in prev)) return prev
        const next = { ...prev }
        delete next[userId]
        return next
      })
    },
    onForceMute: () => {
      if (localAudioTrack) localAudioTrack.enabled = false
      if (user) setRowState(prev => ({ ...prev, [user.id]: { muted: true, volume: prev[user.id]?.volume ?? 0 } }))
    },
    onForceKick: () => setKickedByGm(true),
  })

  function stopLocalMedia() {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null
    setLocalStream(null)
    setLocalAudioTrack(null)
    setLocalVideoTrack(null)
  }

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setAudioInputs(devices.filter(d => d.kind === 'audioinput'))
      setVideoInputs(devices.filter(d => d.kind === 'videoinput'))
      setAudioOutputs(devices.filter(d => d.kind === 'audiooutput'))
    } catch {
      // Enumeração pode falhar sem permissão concedida — dropdowns ficam vazios até lá.
    }
  }, [])

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices)
  }, [refreshDevices])

  const trackSelf = useCallback((nextCameraEnabled: boolean, nextLayoutMode: LayoutMode) => {
    if (!user) return
    broadcast({
      type: 'PARTICIPANT_JOIN',
      userId: user.id,
      characterId: selfCharacter?.id ?? null,
      cloudflareSessionId: sessionIdRef.current ?? '',
      accountName,
      cameraEnabled: nextCameraEnabled,
      layoutMode: isGm ? nextLayoutMode : null,
    })
  }, [user, selfCharacter, accountName, isGm, broadcast])

  const handleChangeLayoutMode = useCallback((mode: LayoutMode) => {
    console.debug('[call:mute] layout mode changed', { mode })
    setLayoutMode(mode)
    trackSelf(cameraOn, mode)
  }, [cameraOn, trackSelf])

  const activeLayoutMode: LayoutMode = isGm
    ? layoutMode
    : (participants.find(p => p.userId === campaign.gmUserId)?.layoutMode ?? 'gallery')

  const joinCall = useCallback(async () => {
    if (!user) return
    setConnecting(true)
    setError(null)
    try {
      const { sessionId } = await api.calls.createSession(campaign.id)
      sessionIdRef.current = sessionId

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: VIDEO_CAPTURE_CONSTRAINTS,
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      const audioTrack = stream.getAudioTracks()[0]
      const videoTrack = stream.getVideoTracks()[0]
      rawAudioTrackRef.current = audioTrack ?? null

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const noiseGate = createNoiseGate(audioContext)
      noiseGateRef.current = noiseGate
      noiseGate.setInputTrack(audioTrack)
      noiseGate.setThresholdDb(noiseGateThresholdDb)
      const processedAudioTrack = noiseGate.destinationTrack

      setLocalAudioTrack(processedAudioTrack)
      setLocalVideoTrack(videoTrack ?? null)
      setSelectedAudioInput(audioTrack?.getSettings().deviceId ?? '')
      setSelectedVideoInput(videoTrack?.getSettings().deviceId ?? '')
      void refreshDevices()

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

      const audioTransceiver = pc.addTransceiver(processedAudioTrack, { direction: 'sendonly' })
      const videoTransceiver = pc.addTransceiver(videoTrack, { direction: 'sendonly', sendEncodings: VIDEO_SEND_ENCODINGS })
      audioTransceiverRef.current = audioTransceiver
      videoTransceiverRef.current = videoTransceiver

      await pc.setLocalDescription(await pc.createOffer())
      await waitForIceGatheringComplete(pc)
      const localDesc = pc.localDescription
      if (!localDesc?.sdp) throw new Error('Falha ao negociar a conexão de vídeo')

      const pushResp = await Promise.race([
        enqueueNegotiation(() => api.calls.negotiateTracks(campaign.id, sessionId, {
          sessionDescription: { sdp: localDesc.sdp, type: 'offer' },
          tracks: [
            { location: 'local', mid: audioTransceiver.mid ?? undefined, trackName: `${sessionId}-audio`, kind: 'audio' },
            { location: 'local', mid: videoTransceiver.mid ?? undefined, trackName: `${sessionId}-video`, kind: 'video' },
          ],
        })),
        rejectAfter(NEGOTIATION_TIMEOUT_MS, CONNECTION_TIMEOUT_MESSAGE),
      ])
      if (pushResp.sessionDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(pushResp.sessionDescription))
      }
      pushReadyRef.current = true

      setCameraOn(true)
      ensureRowState(user.id, 0)
      trackSelf(true, layoutMode)
      setJoined(true)

      for (const [pendingUserId, info] of pendingJoinsRef.current) {
        void pullParticipant(pendingUserId, info.characterId, info.cloudflareSessionId, info.accountName, info.cameraEnabled, info.layoutMode)
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'GM_NOT_IN_CALL') {
        setWaitingForGm(true)
      } else {
        setError((err as Error).message || 'Não foi possível iniciar a chamada')
      }
      pushReadyRef.current = false
      pcRef.current?.close()
      pcRef.current = null
      noiseGateRef.current?.destroy()
      noiseGateRef.current = null
      void audioContextRef.current?.close()
      audioContextRef.current = null
      stopLocalMedia()
    } finally {
      setConnecting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.id, user, selfCharacter, broadcast, ensureRowState, trackSelf, pullParticipant, refreshDevices, layoutMode, noiseGateThresholdDb])

  const handleJoinClick = useCallback(() => {
    if (!isGm && !gmPresent) {
      setWaitingForGm(true)
      return
    }
    void joinCall()
  }, [isGm, gmPresent, joinCall])

  // CallTab só é montado dentro de CampaignCallPage (página própria, aberta
  // em nova aba) — entra na call (ou cai na sala de espera, se o mestre ainda
  // não estiver presente) automaticamente ao carregar, sem exigir clique.
  // Guard via ref (não state): em StrictMode o React invoca todo efeito de
  // mount duas vezes (mount→cleanup→mount) antes do primeiro setState ser
  // processado, então checar `connecting`/`joined` não impediria a segunda
  // chamada — ela leria o mesmo estado inicial da primeira. O ref muda de
  // valor de forma síncrona e sobrevive ao ciclo cleanup→mount do
  // StrictMode, então a segunda invocação vira no-op de verdade.
  const autoJoinedRef = useRef(false)
  useEffect(() => {
    if (autoJoinedRef.current) return
    autoJoinedRef.current = true
    handleJoinClick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (waitingForGm && gmPresent) {
      setWaitingForGm(false)
      void joinCall()
    }
  }, [waitingForGm, gmPresent, joinCall])

  // DEBUG(call-kick-regression): see useCampaignCallChannel.ts top-of-file
  // note. Logs every transition of gmPresent (from → to) so a live repro
  // shows whether it ever flips to false on the player's side at all.
  const prevGmPresentRef = useRef(gmPresent)
  useEffect(() => {
    if (prevGmPresentRef.current !== gmPresent) {
      console.debug('[call:presence] gmPresent changed', { from: prevGmPresentRef.current, to: gmPresent, isGm, joined })
      prevGmPresentRef.current = gmPresent
    }
  }, [gmPresent, isGm, joined])

  const disconnectFromCall = useCallback(() => {
    if (user) {
      // DEBUG(call-kick-regression): see useCampaignCallChannel.ts top-of-file note.
      console.debug('[call:presence] disconnectFromCall → broadcast(PARTICIPANT_LEAVE)', { userId: user.id })
      broadcast({ type: 'PARTICIPANT_LEAVE', userId: user.id })
    }
    pcRef.current?.close()
    pcRef.current = null
    pushReadyRef.current = false
    audioTransceiverRef.current = null
    videoTransceiverRef.current = null
    noiseGateRef.current?.destroy()
    noiseGateRef.current = null
    void audioContextRef.current?.close()
    audioContextRef.current = null
    rawAudioTrackRef.current = null
    stopLocalMedia()
    setParticipants([])
    setRowState({})
    setCameraOn(true)
    sessionIdRef.current = null
    pullMidMapRef.current.clear()
    pendingJoinsRef.current.clear()
    setJoined(false)
  }, [broadcast, user])

  const leaveCall = useCallback(() => {
    disconnectFromCall()
    if (isGm) void api.calls.leaveSession(campaign.id)
  }, [disconnectFromCall, isGm, campaign.id])

  // Se o mestre sair/fechar a aba, o Presence (useCampaignCallChannel) já
  // propaga isso como gmPresent=false para quem estiver conectado — só
  // faltava reagir a essa transição depois de já estar dentro da call (hoje
  // gmPresent só era checado antes de entrar). `!isGm` é defesa em
  // profundidade, não a única proteção: a própria presença do mestre nunca
  // chega a este componente (o hook filtra `key !== selfId`), então
  // `gmPresent` nunca vira `true`/`false` por causa dele mesmo.
  // `joined` e `waitingForGm` são mutuamente exclusivos — toda transição
  // passa por `disconnectFromCall()` (zera `joined`) antes deste efeito
  // setar `waitingForGm`, e o efeito acima só reconecta quando `waitingForGm`
  // já está true, então não há sobreposição nem condição de corrida entre os
  // dois efeitos.
  useEffect(() => {
    if (!isGm && joined && !gmPresent) {
      disconnectFromCall()
      setWaitingForGm(true)
    }
  }, [isGm, joined, gmPresent, disconnectFromCall])

  // Mesmo padrão do efeito acima (state flag + useEffect): o handler passado
  // a useCampaignCallChannel (onForceKick) é montado antes de
  // disconnectFromCall existir neste componente, então só pode sinalizar via
  // state. Nunca chama setWaitingForGm aqui — diferente de "mestre saiu",
  // quem foi removido só reentra clicando em "Entrar na chamada".
  useEffect(() => {
    if (kickedByGm) {
      setKickedByGm(false)
      disconnectFromCall()
      setError('Você foi removido da chamada pelo mestre.')
    }
  }, [kickedByGm, disconnectFromCall])

  useEffect(() => {
    return () => {
      pcRef.current?.close()
      localStreamRef.current?.getTracks().forEach(track => track.stop())
      noiseGateRef.current?.destroy()
      void audioContextRef.current?.close()
      if (isGm) void api.calls.leaveSession(campaign.id)
    }
  }, [isGm, campaign.id])

  const handleToggleCamera = useCallback(() => {
    setCameraOn(prev => {
      const next = !prev
      if (localVideoTrack) localVideoTrack.enabled = next
      trackSelf(next, layoutMode)
      return next
    })
  }, [localVideoTrack, trackSelf, layoutMode])

  const handleForceMuteAll = useCallback((targetUserId: string) => {
    broadcast({ type: 'FORCE_MUTE', targetUserId })
  }, [broadcast])

  const handleKickParticipant = useCallback((targetUserId: string) => {
    broadcast({ type: 'FORCE_KICK', targetUserId })
  }, [broadcast])

  const handleNoiseGateThresholdChange = useCallback((db: number) => {
    setNoiseGateThresholdDb(db)
    noiseGateRef.current?.setThresholdDb(db)
  }, [])

  const getMicLevelDb = useCallback(() => noiseGateRef.current?.getLevelDb() ?? -100, [])

  // O transceiver de áudio sempre envia noiseGateRef.current.destinationTrack,
  // cuja identidade é estável durante toda a call — trocar de mic só troca a
  // fonte que alimenta o grafo do gate (setInputTrack), sem precisar chamar
  // replaceTrack() no sender nem recriar o resto do grafo. localAudioTrack
  // (state) também não muda de identidade nessa troca.
  const switchAudioInput = useCallback(async (deviceId: string) => {
    const stream = localStreamRef.current
    if (!stream || !deviceId) return
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      const newTrack = newStream.getAudioTracks()[0]
      if (!newTrack) return
      const oldTrack = stream.getAudioTracks()[0]
      noiseGateRef.current?.setInputTrack(newTrack)
      if (oldTrack) stream.removeTrack(oldTrack)
      stream.addTrack(newTrack)
      oldTrack?.stop()
      rawAudioTrackRef.current = newTrack
      setSelectedAudioInput(deviceId)
      void refreshDevices()
    } catch (err) {
      setError((err as Error).message || 'Não foi possível trocar o microfone')
    }
  }, [refreshDevices])

  // replaceTrack() no sender do transceiver já existente evita recriar a
  // RTCPeerConnection e renegociar do zero — é exatamente o que a Cloudflare
  // Realtime espera para troca de dispositivo em runtime.

  const switchVideoInput = useCallback(async (deviceId: string) => {
    const stream = localStreamRef.current
    if (!stream || !deviceId) return
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { ...VIDEO_CAPTURE_CONSTRAINTS, deviceId: { exact: deviceId } },
      })
      const newTrack = newStream.getVideoTracks()[0]
      if (!newTrack) return
      const oldTrack = stream.getVideoTracks()[0]
      await videoTransceiverRef.current?.sender.replaceTrack(newTrack)
      if (oldTrack) stream.removeTrack(oldTrack)
      stream.addTrack(newTrack)
      newTrack.enabled = oldTrack?.enabled ?? true
      oldTrack?.stop()
      setLocalVideoTrack(newTrack)
      setSelectedVideoInput(deviceId)
      void refreshDevices()
    } catch (err) {
      setError((err as Error).message || 'Não foi possível trocar a câmera')
    }
  }, [refreshDevices])

  const switchAudioOutput = useCallback((deviceId: string) => {
    setSelectedAudioOutput(deviceId)
  }, [])

  const selfTile: CallTileData = {
    key: 'self',
    userId: user?.id ?? 'self',
    stream: localStream,
    audioTrack: localAudioTrack,
    displayName: selfCharacter?.name ?? 'Você',
    subtitle: isGm ? 'Mestre (Você)' : selfCharacter ? 'Você' : undefined,
    image: selfCharacter?.imageUrl ?? null,
    characterId: selfCharacter?.id ?? null,
    hp: selfCharacter ? (selfCharacter.currentHp ?? selfCharacter.hp) : null,
    maxHp: selfCharacter?.hp ?? null,
    isGm,
    muted: user ? (rowState[user.id]?.muted ?? false) : false,
    volume: user ? (rowState[user.id]?.volume ?? 0) : 0,
    cameraEnabled: cameraOn,
    canViewSheet: !!selfCharacter && (selfCharacter.isPublic || selfCharacter.userId === user?.id || isGm),
  }

  const remoteVideoTiles: CallTileData[] = participants.map(p => {
    const char = campaign.players.find(pl => pl.id === p.characterId)
    const isGmParticipant = campaign.gmUserId === p.userId
    return {
      key: p.userId,
      userId: p.userId,
      stream: p.stream,
      audioTrack: p.audioTrack,
      displayName: char?.name ?? (isGmParticipant ? 'Mestre' : 'Participante'),
      subtitle: isGmParticipant ? 'Mestre' : undefined,
      image: char?.imageUrl ?? null,
      characterId: p.characterId,
      hp: char ? (char.currentHp ?? char.hp) : null,
      maxHp: char?.hp ?? null,
      isGm: isGmParticipant,
      muted: rowState[p.userId]?.muted ?? false,
      volume: rowState[p.userId]?.volume ?? 1,
      cameraEnabled: p.cameraEnabled,
      canViewSheet: !!char && (char.isPublic || char.userId === user?.id || isGm),
    }
  })

  const videoTiles: CallTileData[] = [selfTile, ...remoteVideoTiles]
  const masterTile = videoTiles.find(t => t.isGm)
  const otherTiles = videoTiles.filter(t => t !== masterTile)
  const spotlightActive = isSpotlightActive(activeLayoutMode, masterTile)

  const galleryContainerRef = useRef<HTMLDivElement>(null)
  const galleryLayout = useGalleryLayout(galleryContainerRef, joined ? videoTiles.length : 0)

  function renderParticipantTile(t: CallTileData) {
    return (
      <CallParticipantTile
        userId={t.userId}
        stream={t.stream}
        audioTrack={t.audioTrack}
        displayName={t.displayName}
        subtitle={t.subtitle}
        image={t.image}
        characterId={t.characterId}
        hp={t.hp}
        maxHp={t.maxHp}
        isGm={t.isGm}
        muted={t.muted}
        volume={t.volume}
        cameraEnabled={t.cameraEnabled}
        sinkId={selectedAudioOutput}
        canViewSheet={t.canViewSheet}
        onViewSheet={
          t.canViewSheet && t.characterId
            ? () => window.open(`/ficha/${t.characterId}?campaignId=${campaign.id}${isGm ? '&isGm=1' : ''}`, '_blank', 'noopener,noreferrer')
            : null
        }
        onRemove={isGm && !t.isGm ? () => handleKickParticipant(t.userId) : null}
      />
    )
  }

  const sidebarRows = user ? [
    {
      userId: user.id,
      accountName,
      characterName: selfCharacter?.name ?? 'Você',
      isGm,
      isSelf: true,
      muted: rowState[user.id]?.muted ?? false,
      volume: rowState[user.id]?.volume ?? 0,
      cameraEnabled: cameraOn,
    },
    ...participants.map(p => {
      const char = campaign.players.find(pl => pl.id === p.characterId)
      const isGmParticipant = campaign.gmUserId === p.userId
      return {
        userId: p.userId,
        accountName: p.accountName,
        characterName: char?.name ?? (isGmParticipant ? 'Mestre' : 'Participante'),
        isGm: isGmParticipant,
        isSelf: false,
        muted: rowState[p.userId]?.muted ?? false,
        volume: rowState[p.userId]?.volume ?? 1,
        cameraEnabled: p.cameraEnabled,
      }
    }),
  ] : []

  return (
    <div style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 1350, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#EEF4FC' }}>Chamada de Sessão</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Vídeo e áudio ao vivo entre os participantes desta campanha.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {joined && (
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(v => !v)}
                title="Participantes"
                style={{
                  background: 'rgba(4,6,12,0.72)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                  cursor: 'pointer', color: '#EEF4FC', fontSize: '1.1rem', width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ☰
              </button>
            )}
            {!joined && !waitingForGm ? (
              <button
                onClick={handleJoinClick}
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
            ) : joined ? (
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
            ) : null}
          </div>
        </div>

        {error && (
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: '#C05050',
            background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.25)',
            borderRadius: 4, padding: '0.65rem 0.9rem', marginBottom: '1.25rem', flexShrink: 0,
          }}>
            {error}
          </p>
        )}

        {waitingForGm ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Aguardando o mestre entrar na chamada… você será conectado automaticamente assim que ele entrar.
          </p>
        ) : !joined ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Ao entrar, o navegador vai pedir permissão de câmera e microfone.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
            <div ref={galleryContainerRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex',
                flexDirection: spotlightActive ? 'column' : 'row',
                flexWrap: spotlightActive ? 'nowrap' : 'wrap',
                alignContent: 'flex-start', justifyContent: spotlightActive ? 'flex-start' : 'center', gap: spotlightActive ? '1rem' : GALLERY_GAP,
              }}>
                {masterTile && (
                  <div style={getMasterWrapperStyle(spotlightActive)}>
                    <div style={getTileWrapperStyle(spotlightActive, galleryLayout, videoTiles.indexOf(masterTile))}>
                      {renderParticipantTile(masterTile)}
                    </div>
                  </div>
                )}

                <div className={getOthersWrapperClassName(spotlightActive)} style={getOthersWrapperStyle(spotlightActive)}>
                  {otherTiles.map(t => (
                    <div
                      key={t.key}
                      className={getOtherTileClassName(spotlightActive)}
                      style={getTileWrapperStyle(spotlightActive, galleryLayout, videoTiles.indexOf(t))}
                    >
                      {renderParticipantTile(t)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex" style={{ flexShrink: 0 }}>
              <CallSidebar
                viewerIsGm={isGm}
                activeLayoutMode={activeLayoutMode}
                onChangeLayoutMode={handleChangeLayoutMode}
                rows={sidebarRows}
                onToggleMute={handleToggleMute}
                onVolumeChange={handleVolumeChange}
                onForceMuteAll={handleForceMuteAll}
                onToggleCamera={handleToggleCamera}
                audioInputs={audioInputs}
                videoInputs={videoInputs}
                audioOutputs={audioOutputs}
                selectedAudioInput={selectedAudioInput}
                selectedVideoInput={selectedVideoInput}
                selectedAudioOutput={selectedAudioOutput}
                onAudioInputChange={switchAudioInput}
                onVideoInputChange={switchVideoInput}
                onAudioOutputChange={switchAudioOutput}
                noiseGateThresholdDb={noiseGateThresholdDb}
                onNoiseGateThresholdChange={handleNoiseGateThresholdChange}
                getMicLevelDb={getMicLevelDb}
              />
            </div>

            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.6)' }}
                  />
                  <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    style={{
                      position: 'fixed', top: 52, right: 0, bottom: 0,
                      width: 280, zIndex: 81,
                      background: 'var(--color-deep)',
                      borderLeft: '1px solid var(--color-border)',
                    }}
                  >
                    <CallSidebar
                      viewerIsGm={isGm}
                      activeLayoutMode={activeLayoutMode}
                      onChangeLayoutMode={handleChangeLayoutMode}
                      rows={sidebarRows}
                      onToggleMute={handleToggleMute}
                      onVolumeChange={handleVolumeChange}
                      onForceMuteAll={handleForceMuteAll}
                      onToggleCamera={handleToggleCamera}
                      audioInputs={audioInputs}
                      videoInputs={videoInputs}
                      audioOutputs={audioOutputs}
                      selectedAudioInput={selectedAudioInput}
                      selectedVideoInput={selectedVideoInput}
                      selectedAudioOutput={selectedAudioOutput}
                      onAudioInputChange={switchAudioInput}
                      onVideoInputChange={switchVideoInput}
                      onAudioOutputChange={switchAudioOutput}
                      noiseGateThresholdDb={noiseGateThresholdDb}
                      onNoiseGateThresholdChange={handleNoiseGateThresholdChange}
                      getMicLevelDb={getMicLevelDb}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
