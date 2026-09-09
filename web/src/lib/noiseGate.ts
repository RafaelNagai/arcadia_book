const ATTACK_TIME_CONSTANT = 0.015
const RELEASE_TIME_CONSTANT = 0.25
const LEVEL_FLOOR_DB = -100
const FFT_SIZE = 1024

export interface NoiseGate {
  setInputTrack(track: MediaStreamTrack): void
  setThresholdDb(db: number): void
  getLevelDb(): number
  readonly destinationTrack: MediaStreamTrack
  destroy(): void
}

// Grafo: source → analyser → gain → destination. O mesmo AnalyserNode
// alimenta tanto a decisão do gate quanto o medidor visual (CallSidebar) —
// não duplicar. gain.setTargetAtTime (não gain.value direto) evita zipper
// noise ao abrir/fechar o gate.
export function createNoiseGate(context: AudioContext): NoiseGate {
  const analyser = context.createAnalyser()
  analyser.fftSize = FFT_SIZE
  const gainNode = context.createGain()
  gainNode.gain.value = 0
  const destinationNode = context.createMediaStreamDestination()

  analyser.connect(gainNode)
  gainNode.connect(destinationNode)

  const timeDomainBuffer = new Float32Array(analyser.fftSize)

  let sourceNode: MediaStreamAudioSourceNode | null = null
  let thresholdDb = -70
  let currentLevelDb = LEVEL_FLOOR_DB
  let gateOpen = false
  let rafId: number | null = null

  function tick() {
    analyser.getFloatTimeDomainData(timeDomainBuffer)
    let sumSquares = 0
    for (let i = 0; i < timeDomainBuffer.length; i++) {
      sumSquares += timeDomainBuffer[i] * timeDomainBuffer[i]
    }
    const rms = Math.sqrt(sumSquares / timeDomainBuffer.length)
    currentLevelDb = rms > 0 ? Math.max(LEVEL_FLOOR_DB, 20 * Math.log10(rms)) : LEVEL_FLOOR_DB

    const shouldOpen = currentLevelDb >= thresholdDb
    if (shouldOpen !== gateOpen) {
      gateOpen = shouldOpen
      const timeConstant = gateOpen ? ATTACK_TIME_CONSTANT : RELEASE_TIME_CONSTANT
      gainNode.gain.setTargetAtTime(gateOpen ? 1 : 0, context.currentTime, timeConstant)
    }

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  return {
    setInputTrack(track: MediaStreamTrack) {
      sourceNode?.disconnect()
      sourceNode = context.createMediaStreamSource(new MediaStream([track]))
      sourceNode.connect(analyser)
    },
    setThresholdDb(db: number) {
      thresholdDb = db
    },
    getLevelDb() {
      return currentLevelDb
    },
    get destinationTrack() {
      return destinationNode.stream.getAudioTracks()[0]
    },
    destroy() {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = null
      sourceNode?.disconnect()
      sourceNode = null
      analyser.disconnect()
      gainNode.disconnect()
      destinationNode.disconnect()
    },
  }
}
