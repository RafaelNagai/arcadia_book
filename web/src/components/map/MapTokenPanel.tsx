import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/apiClient'
import { getAccent } from '@/components/character/types'
import type { MapBroadcastEvent } from '@/hooks/useMapRealtime'
import type { CampaignChar } from '@/data/campaignTypes'
import type { GameMap, MapToken, CreatureInstance } from '@/lib/mapTypes'
import type { Creature } from '@/data/creatureTypes'
import { creatureSlug } from '@/components/creature/constants'
import { saveCreaturePreferredSize } from '@/lib/creatureInstances'
import creaturesData from '@creatures'
import { MapTokenModal } from './MapTokenModal'

const ALL_CREATURES = creaturesData as Creature[]

interface MapTokenPanelProps {
  campaignId: string
  map: GameMap
  tokens: MapToken[]
  allChars: CampaignChar[]
  npcIds: Set<string>
  pendingCharIds: string[]
  creatureInstances: CreatureInstance[]
  onTokensChange: (tokens: MapToken[]) => void
  onBroadcast: (event: MapBroadcastEvent) => void
  onTokenEdit?: (tokenId: string) => void
  onAddPendingChar: (charId: string) => void
  onRemovePendingChar: (charId: string) => void
  onAddCreatureToList: (creature: Creature) => void
  onCreatureInstanceUpdate: (instanceId: string, updates: Partial<CreatureInstance>) => void
  onCreatureInstanceRemove: (instanceId: string) => void
}

// ── Group header ───────────────────────────────────────────────────────────────

function GroupHeader({ label, count, open, onToggle }: {
  label: string; count: number; open: boolean; onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '0.2rem 0.25rem', borderRadius: 3,
      }}
    >
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', flex: 1, textAlign: 'left' }}>
        {label}
      </span>
      {count > 0 && (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '0.05rem 0.3rem' }}>
          {count}
        </span>
      )}
      <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.6rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1 }}>
        ▾
      </span>
    </button>
  )
}

// ── Add modal ─────────────────────────────────────────────────────────────────

function AddModal({ type, allChars, npcIds, activeCharIds, creatures, onAddChar, onAddCreature, onClose }: {
  type: 'char' | 'npc' | 'creature'
  allChars: CampaignChar[]
  npcIds: Set<string>
  activeCharIds: Set<string>
  creatures: Creature[]
  onAddChar: (charId: string) => void
  onAddCreature: (creature: Creature) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')

  const availableChars = allChars.filter(c => {
    const isNpc = npcIds.has(c.id)
    if (type === 'char' && isNpc) return false
    if (type === 'npc' && !isNpc) return false
    if (activeCharIds.has(c.id)) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const availableCreatures = type === 'creature'
    ? creatures.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const title = type === 'char' ? 'Adicionar Personagem' : type === 'npc' ? 'Adicionar NPC' : 'Adicionar Criatura'
  const accent = type === 'creature' ? '#A03020' : 'var(--color-arcano)'
  const accentBg = type === 'creature' ? 'rgba(160,48,32,0.12)' : 'rgba(200,146,42,0.12)'
  const accentBorder = type === 'creature' ? 'rgba(160,48,32,0.3)' : 'rgba(200,146,42,0.3)'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '1.25rem', width: 360, maxWidth: 'calc(100vw - 2rem)', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.85)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#EEF4FC' }}>
            {title}
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '1rem', padding: '0.1rem' }}>
            ✕
          </button>
        </div>

        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar…"
          style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#EEF4FC', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
        />

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '52vh' }}>
          {type !== 'creature' && availableChars.length === 0 && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem 0' }}>
              Todos já adicionados.
            </p>
          )}
          {type !== 'creature' && availableChars.map(char => {
            const acc = getAccent(char.afinidade)
            return (
              <button
                key={char.id}
                onClick={() => onAddChar(char.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = accentBg; (e.currentTarget as HTMLButtonElement).style.borderColor = accentBorder }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: acc.bg, border: `2px solid ${acc.text}`, overflow: 'hidden', flexShrink: 0 }}>
                  {char.imageUrl && <img src={char.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#EEF4FC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{char.name}</p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: acc.text }}>{char.race} · Nv {char.level}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: accent }}>+ Adicionar</span>
              </button>
            )
          })}

          {type === 'creature' && availableCreatures.map(creature => (
            <button
              key={creatureSlug(creature.name)}
              onClick={() => onAddCreature(creature)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 5, background: 'rgba(160,48,32,0.04)', border: '1px solid rgba(160,48,32,0.12)', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = accentBg; (e.currentTarget as HTMLButtonElement).style.borderColor = accentBorder }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(160,48,32,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(160,48,32,0.12)' }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(160,48,32,0.2)', border: '2px solid rgba(160,48,32,0.5)', overflow: 'hidden', flexShrink: 0 }}>
                {creature.image
                  ? <img src={creature.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#A03020', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>{creature.name[0]}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: '#F0D0C0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{creature.name}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: 'rgba(240,208,192,0.4)' }}>Nv {creature.levelRange} · HP {creature.hp}</p>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: '#C04030' }}>+ Adicionar</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MapTokenPanel({
  campaignId,
  map,
  tokens,
  allChars,
  npcIds,
  pendingCharIds,
  creatureInstances,
  onTokensChange,
  onBroadcast,
  onTokenEdit,
  onAddPendingChar,
  onRemovePendingChar,
  onAddCreatureToList,
  onCreatureInstanceUpdate,
  onCreatureInstanceRemove,
}: MapTokenPanelProps) {
  const navigate = useNavigate()
  const [removing, setRemoving] = useState<string | null>(null)
  const [configuringChar, setConfiguringChar] = useState<CampaignChar | null>(null)
  const [pendingVisionRadii, setPendingVisionRadii] = useState<Record<string, number | null>>({})
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [addModalType, setAddModalType] = useState<'char' | 'npc' | 'creature' | null>(null)
  const [expandedCreatureId, setExpandedCreatureId] = useState<string | null>(null)

  const [playersOpen, setPlayersOpen] = useState(true)
  const [npcsOpen, setNpcsOpen] = useState(true)
  const [creaturesOpen, setCreaturesOpen] = useState(true)

  const sortedLayers = [...map.layers].sort((a, b) => b.orderIndex - a.orderIndex)

  // Active chars = those in pendingCharIds or already placed (in tokens)
  const placedCharIds = new Set(tokens.map(t => t.characterId))
  const activeCharIds = new Set([...pendingCharIds, ...placedCharIds])

  const activePlayerChars = allChars.filter(c => !npcIds.has(c.id) && activeCharIds.has(c.id))
  const activeNpcChars = allChars.filter(c => npcIds.has(c.id) && activeCharIds.has(c.id))

  const tokenForChar = (charId: string) => tokens.find(t => t.characterId === charId)

  // ── Remove char token from canvas (char stays in list as pending) ──────────
  async function handleRemoveFromCanvas(token: MapToken) {
    setRemoving(token.id)
    try {
      await api.maps.deleteToken(campaignId, map.id, token.id)
      onTokensChange(tokens.filter(t => t.id !== token.id))
      onBroadcast({ type: 'TOKEN_REMOVE', tokenId: token.id })
      // char stays in pendingCharIds so it remains in the list
      onAddPendingChar(token.characterId)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setRemoving(null)
    }
  }

  // ── Remove char from list entirely (and canvas if placed) ─────────────────
  async function handleRemoveCharFromList(charId: string) {
    const token = tokenForChar(charId)
    if (token) {
      setRemoving(token.id)
      try {
        await api.maps.deleteToken(campaignId, map.id, token.id)
        onTokensChange(tokens.filter(t => t.id !== token.id))
        onBroadcast({ type: 'TOKEN_REMOVE', tokenId: token.id })
      } catch (err) {
        alert((err as Error).message)
        setRemoving(null)
        return
      }
      setRemoving(null)
    }
    onRemovePendingChar(charId)
  }

  function handleDragStart(e: React.DragEvent, char: CampaignChar) {
    e.dataTransfer.setData('charId', char.id)
    const vr = pendingVisionRadii[char.id]
    e.dataTransfer.setData('visionRadius', vr != null ? String(vr) : '')
    e.dataTransfer.effectAllowed = 'copy'
  }

  function handleCreatureDragStart(e: React.DragEvent, instance: CreatureInstance) {
    e.dataTransfer.setData('creatureInstanceId', instance.instanceId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // ── Character row ─────────────────────────────────────────────────────────

  function CharRow({ char }: { char: CampaignChar }) {
    const acc = getAccent(char.afinidade)
    const token = tokenForChar(char.id)
    const isPlaced = !!token
    const layerName = isPlaced ? sortedLayers.find(l => l.id === token.layerId)?.name : undefined

    return (
      <div
        draggable={!isPlaced}
        onDragStart={!isPlaced ? (e) => handleDragStart(e, char) : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          padding: '0.35rem 0.5rem', borderRadius: 4,
          background: isPlaced ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isPlaced ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
          cursor: isPlaced ? 'default' : 'grab',
          userSelect: 'none',
          marginBottom: '0.2rem',
        }}
        onMouseEnter={e => {
          if (!isPlaced) { (e.currentTarget as HTMLDivElement).style.background = 'rgba(200,146,42,0.06)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,146,42,0.18)' }
        }}
        onMouseLeave={e => {
          if (!isPlaced) { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.04)' }
        }}
      >
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: acc.bg, border: `2px solid ${acc.text}`, overflow: 'hidden', flexShrink: 0 }}>
          {char.imageUrl && <img src={char.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: isPlaced ? '#EEF4FC' : 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {char.name}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.57rem', color: isPlaced ? acc.text : 'rgba(255,255,255,0.25)' }}>
            {isPlaced ? (layerName ?? 'no mapa') : 'arrastar para colocar'}
          </p>
        </div>
        {/* config button — shown for unplaced (pre-configure vision radius) */}
        {!isPlaced && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfiguringChar(char) }}
            title="Configurar token"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: pendingVisionRadii[char.id] != null ? 'var(--color-arcano)' : 'rgba(255,255,255,0.2)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = pendingVisionRadii[char.id] != null ? 'var(--color-arcano)' : 'rgba(255,255,255,0.2)' }}
          >
            ⚙
          </button>
        )}
        {/* config button — for placed tokens */}
        {isPlaced && onTokenEdit && (
          <button
            onClick={() => onTokenEdit(token.id)}
            title="Configurar token"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)' }}
          >
            ⚙
          </button>
        )}
        {/* remove: placed → unplace (keep in list); pending → remove from list */}
        {isPlaced ? (
          <button
            onClick={() => handleRemoveFromCanvas(token)}
            disabled={removing === token.id}
            title="Remover do canvas (mantém na lista)"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.18)' }}
          >
            {removing === token.id ? '…' : '↙'}
          </button>
        ) : (
          <button
            onClick={() => handleRemoveCharFromList(char.id)}
            title="Remover da lista"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.18)' }}
          >
            ✕
          </button>
        )}
      </div>
    )
  }

  // ── Creature row ──────────────────────────────────────────────────────────

  function CreatureRow({ instance }: { instance: CreatureInstance }) {
    const hpPct = instance.currentHp / instance.maxHp
    const hpColor = hpPct > 0.6 ? '#6FC892' : hpPct > 0.3 ? '#E8B84B' : '#C05050'
    const layerName = instance.placed ? sortedLayers.find(l => l.id === instance.layerId)?.name : undefined
    const isExpanded = expandedCreatureId === instance.instanceId

    function handleSizeChange(newSize: number) {
      onCreatureInstanceUpdate(instance.instanceId, { size: newSize })
      saveCreaturePreferredSize(instance.creatureSlug, newSize)
    }

    return (
      <div
        draggable={!instance.placed}
        onDragStart={!instance.placed ? (e) => handleCreatureDragStart(e, instance) : undefined}
        style={{
          padding: '0.4rem 0.5rem', borderRadius: 4,
          background: 'rgba(160,48,32,0.06)',
          border: `1px solid ${instance.placed ? 'rgba(160,48,32,0.2)' : 'rgba(160,48,32,0.12)'}`,
          cursor: instance.placed ? 'default' : 'grab',
          userSelect: 'none',
          marginBottom: '0.2rem',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(160,48,32,0.25)', border: '2px solid #A03020', overflow: 'hidden', flexShrink: 0 }}>
            {instance.image
              ? <img src={instance.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '0.7rem', color: '#A03020', fontFamily: 'var(--font-display)' }}>{instance.creatureName[0]}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: '#F0D0C0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {instance.creatureName}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.57rem', color: 'rgba(240,208,192,0.4)' }}>
              {instance.placed ? (layerName ?? 'no mapa') : 'arrastar para colocar'}
            </p>
          </div>
          <button
            onClick={() => navigate(`/criatura/${instance.creatureSlug}`)}
            title="Ver ficha"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,208,192,0.25)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C04030' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,208,192,0.25)' }}
          >
            ↗
          </button>
          {instance.placed && (
            <button
              onClick={() => setExpandedCreatureId(isExpanded ? null : instance.instanceId)}
              title="Redimensionar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isExpanded ? '#C04030' : 'rgba(255,255,255,0.18)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = isExpanded ? '#C04030' : 'rgba(255,255,255,0.18)' }}
            >
              ⚙
            </button>
          )}
          <button
            onClick={() => onCreatureInstanceRemove(instance.instanceId)}
            title="Remover"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', padding: '0.1rem', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.18)' }}
          >
            ✕
          </button>
        </div>

        {/* HP controls — only for placed instances */}
        {instance.placed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
            <button
              onClick={() => onCreatureInstanceUpdate(instance.instanceId, { currentHp: Math.max(0, instance.currentHp - 1) })}
              style={{ background: 'rgba(160,48,32,0.15)', border: '1px solid rgba(160,48,32,0.3)', borderRadius: 3, color: '#F0D0C0', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              −
            </button>
            <div style={{ flex: 1, position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${hpPct * 100}%`, borderRadius: 3, background: hpColor, transition: 'width 0.15s' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', color: hpColor, minWidth: 34, textAlign: 'right' }}>
              {instance.currentHp}/{instance.maxHp}
            </span>
            <button
              onClick={() => onCreatureInstanceUpdate(instance.instanceId, { currentHp: Math.min(instance.maxHp, instance.currentHp + 1) })}
              style={{ background: 'rgba(160,48,32,0.15)', border: '1px solid rgba(160,48,32,0.3)', borderRadius: 3, color: '#F0D0C0', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              +
            </button>
          </div>
        )}

        {/* Size controls */}
        {isExpanded && (
          <div style={{ marginTop: '0.45rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(160,48,32,0.2)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,208,192,0.35)', marginBottom: '0.3rem' }}>
              Tamanho — {instance.size.toFixed(2)}×
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="range" min={0.25} max={6} step={0.25}
                value={instance.size}
                onChange={e => handleSizeChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#A03020' }}
              />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(240,208,192,0.55)', width: 30, textAlign: 'right' }}>
                {instance.size.toFixed(2)}×
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const totalTokens = activePlayerChars.length + activeNpcChars.length + creatureInstances.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

      {/* Header + Adicionar button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '0.25rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
          Tokens no mapa {totalTokens > 0 && <span style={{ opacity: 0.6 }}>({totalTokens})</span>}
        </p>

        {/* Adicionar dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAddMenuOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.55rem', borderRadius: 4,
              background: addMenuOpen ? 'rgba(200,146,42,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${addMenuOpen ? 'rgba(200,146,42,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: addMenuOpen ? 'var(--color-arcano)' : 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-ui)', fontSize: '0.62rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            + Adicionar
            <span style={{ fontSize: '0.5rem', transform: addMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </button>
          {addMenuOpen && (
            <>
              <div onClick={() => setAddMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 99,
                background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6, padding: '0.3rem', minWidth: 130,
                boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                display: 'flex', flexDirection: 'column', gap: '0.1rem',
              }}>
                {(['char', 'npc', 'creature'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setAddModalType(t); setAddMenuOpen(false) }}
                    style={{
                      width: '100%', padding: '0.4rem 0.6rem', borderRadius: 4,
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-ui)', fontSize: '0.72rem',
                      color: t === 'creature' ? '#F0D0C0' : '#EEF4FC',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = t === 'creature' ? 'rgba(160,48,32,0.12)' : 'rgba(200,146,42,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
                  >
                    {t === 'char' ? 'Personagem' : t === 'npc' ? 'NPC' : 'Criatura'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {totalTokens === 0 && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem', paddingTop: '0.15rem' }}>
          Nenhum token adicionado.
        </p>
      )}

      {/* Personagens group */}
      {activePlayerChars.length > 0 && (
        <div>
          <GroupHeader label="Personagens" count={activePlayerChars.length} open={playersOpen} onToggle={() => setPlayersOpen(v => !v)} />
          {playersOpen && activePlayerChars.map(char => <CharRow key={char.id} char={char} />)}
        </div>
      )}

      {/* NPCs group */}
      {activeNpcChars.length > 0 && (
        <div>
          <GroupHeader label="NPCs" count={activeNpcChars.length} open={npcsOpen} onToggle={() => setNpcsOpen(v => !v)} />
          {npcsOpen && activeNpcChars.map(char => <CharRow key={char.id} char={char} />)}
        </div>
      )}

      {/* Criaturas group */}
      {creatureInstances.length > 0 && (
        <div>
          <GroupHeader label="Criaturas" count={creatureInstances.length} open={creaturesOpen} onToggle={() => setCreaturesOpen(v => !v)} />
          {creaturesOpen && creatureInstances.map(instance => <CreatureRow key={instance.instanceId} instance={instance} />)}
        </div>
      )}

      {/* Pre-configure vision radius for pending chars */}
      {configuringChar && (
        <MapTokenModal
          character={configuringChar}
          visionRadius={pendingVisionRadii[configuringChar.id] ?? null}
          size={map.defaultTokenSize ?? 1}
          map={map}
          onSave={(vr) => {
            setPendingVisionRadii(prev => ({ ...prev, [configuringChar.id]: vr }))
          }}
          onClose={() => setConfiguringChar(null)}
        />
      )}

      {/* Add modal */}
      {addModalType && (
        <AddModal
          type={addModalType}
          allChars={allChars}
          npcIds={npcIds}
          activeCharIds={activeCharIds}
          creatures={ALL_CREATURES}
          onAddChar={(charId) => { onAddPendingChar(charId); setAddModalType(null) }}
          onAddCreature={(creature) => { onAddCreatureToList(creature); setAddModalType(null) }}
          onClose={() => setAddModalType(null)}
        />
      )}
    </div>
  )
}
