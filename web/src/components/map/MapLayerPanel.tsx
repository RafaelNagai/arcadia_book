import { useRef, useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '@/lib/apiClient'
import type { MapBroadcastEvent } from '@/hooks/useMapRealtime'
import type { GameMap, MapLayer } from '@/lib/mapTypes'

interface MapLayerPanelProps {
  campaignId: string
  map: GameMap
  onMapChange: (map: GameMap) => void
  onBroadcast: (event: MapBroadcastEvent) => void
}

function SortableLayerItem({
  layer, isCurrent, isSelecting, onSelect, onDelete,
}: {
  layer: MapLayer
  isCurrent: boolean
  isSelecting: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.5rem 0.6rem', borderRadius: 4,
        background: isCurrent ? 'rgba(200,146,42,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isCurrent ? 'rgba(200,146,42,0.3)' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer',
      }}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        title="Arrastar para reordenar"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          color: 'rgba(255,255,255,0.25)',
          fontSize: '0.85rem', lineHeight: 1,
          flexShrink: 0, padding: '0 0.1rem',
        }}
      >
        ⠿
      </div>

      {/* Thumbnail */}
      <div style={{
        width: 32, height: 24, borderRadius: 3, overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        <img src={layer.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
          fontWeight: isCurrent ? 700 : 400,
          color: isCurrent ? 'var(--color-arcano)' : '#EEF4FC',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {layer.name}
        </p>
      </div>

      {isCurrent && (
        <span style={{ fontSize: '0.6rem', color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>
          ●
        </span>
      )}
      {!isCurrent && isSelecting && (
        <span style={{ fontSize: '0.6rem', color: 'rgba(200,146,42,0.45)', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>…</span>
      )}

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        title="Remover layer"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', padding: '0.1rem', flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)' }}
      >
        ✕
      </button>
    </div>
  )
}

export function MapLayerPanel({ campaignId, map, onMapChange, onBroadcast }: MapLayerPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  // Highest floor at the top of the list
  const sortedLayers = [...map.layers].sort((a, b) => b.orderIndex - a.orderIndex)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await api.upload.mapLayerImage(map.id, file)
      const res = await api.maps.createLayer(campaignId, map.id, {
        name: file.name.replace(/\.[^.]+$/, ''),
        order_index: map.layers.length,
        image_url: url,
      })
      const layer = res.layer as MapLayer
      const isFirst = map.layers.length === 0

      if (isFirst) {
        await api.maps.activateLayer(campaignId, map.id, layer.id)
        const updatedLayers = [{ ...layer, isActive: true }]
        onMapChange({ ...map, layers: updatedLayers })
        onBroadcast({ type: 'LAYER_CHANGE', layerId: layer.id, layers: updatedLayers })
      } else {
        onMapChange({ ...map, layers: [...map.layers, { ...layer, isActive: false }] })
      }
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSelect(layerId: string) {
    if (layerId === map.layers.find(l => l.isActive)?.id) return
    setSelectingId(layerId)
    try {
      await api.maps.activateLayer(campaignId, map.id, layerId)
      const updatedLayers = map.layers.map(l => ({ ...l, isActive: l.id === layerId }))
      onMapChange({ ...map, layers: updatedLayers })
      onBroadcast({ type: 'LAYER_CHANGE', layerId, layers: updatedLayers })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSelectingId(null)
    }
  }

  async function handleDelete(layer: MapLayer) {
    if (!confirm(`Remover layer "${layer.name}"?`)) return
    try {
      await api.maps.deleteLayer(campaignId, map.id, layer.id)
      onMapChange({ ...map, layers: map.layers.filter(l => l.id !== layer.id) })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedLayers.findIndex(l => l.id === active.id)
    const newIndex = sortedLayers.findIndex(l => l.id === over.id)
    const newSortedOrder = arrayMove(sortedLayers, oldIndex, newIndex)
    const total = newSortedOrder.length

    // Position 0 (top of list) = highest orderIndex
    const updatedLayers = map.layers.map(layer => {
      const newPos = newSortedOrder.findIndex(l => l.id === layer.id)
      return { ...layer, orderIndex: total - 1 - newPos }
    })

    onMapChange({ ...map, layers: updatedLayers })

    for (const layer of updatedLayers) {
      const original = map.layers.find(l => l.id === layer.id)
      if (original?.orderIndex !== layer.orderIndex) {
        try {
          await api.maps.updateLayer(campaignId, map.id, layer.id, { order_index: layer.orderIndex })
        } catch { /* keep optimistic */ }
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem',
      }}>
        Layers
      </p>

      {sortedLayers.length === 0 && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          Nenhuma layer ainda.
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedLayers.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {sortedLayers.map(layer => (
            <SortableLayerItem
              key={layer.id}
              layer={layer}
              isCurrent={layer.isActive}
              isSelecting={selectingId === layer.id}
              onSelect={() => handleSelect(layer.id)}
              onDelete={() => handleDelete(layer)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: '0.5rem', borderRadius: 4,
          background: 'rgba(200,146,42,0.06)', border: '1px dashed rgba(200,146,42,0.25)',
          color: uploading ? 'rgba(200,146,42,0.4)' : 'var(--color-arcano)',
          fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'Enviando…' : '+ Adicionar layer'}
      </button>
    </div>
  )
}
