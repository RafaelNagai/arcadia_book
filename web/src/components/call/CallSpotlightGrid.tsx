import { CallParticipantTile } from './CallParticipantTile'
import type { CallTileData } from './callTypes'

interface CallSpotlightGridProps {
  master: CallTileData
  others: CallTileData[]
  sinkId: string
}

function renderTile(t: CallTileData, sinkId: string) {
  return (
    <CallParticipantTile
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
      sinkId={sinkId}
    />
  )
}

export function CallSpotlightGrid({ master, others, sinkId }: CallSpotlightGridProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', flexShrink: 0 }}>
        {renderTile(master, sinkId)}
      </div>

      {others.length > 0 && (
        <div className="flex gap-3 flex-nowrap overflow-x-auto lg:flex-wrap lg:overflow-x-visible lg:justify-center">
          {others.map(t => (
            <div key={t.key} className="w-[140px] shrink-0 lg:w-[190px]">
              {renderTile(t, sinkId)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
