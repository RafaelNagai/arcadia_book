import { useRef, useState } from 'react'
import { api } from '@/lib/apiClient'
import type { GameMap, MapLayer } from '@/lib/mapTypes'

interface MapLayerPanelProps {
  campaignId: string
  map: GameMap
  onMapChange: (map: GameMap) => void
}

export function MapLayerPanel({ campaignId, map, onMapChange }: MapLayerPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)

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
      onMapChange({ ...map, layers: [...map.layers, layer] })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleActivate(layerId: string) {
    setActivating(layerId)
    try {
      await api.maps.activateLayer(campaignId, map.id, layerId)
      onMapChange({
        ...map,
        layers: map.layers.map(l => ({ ...l, isActive: l.id === layerId })),
      })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setActivating(null)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)', paddingLeft: '0.25rem',
      }}>
        Layers
      </p>

      {map.layers.map((layer, i) => (
        <div
          key={layer.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.6rem', borderRadius: 4,
            background: layer.isActive ? 'rgba(200,146,42,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${layer.isActive ? 'rgba(200,146,42,0.3)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          <div style={{
            width: 32, height: 24, borderRadius: 3, overflow: 'hidden',
            background: 'rgba(255,255,255,0.06)', flexShrink: 0,
          }}>
            <img src={layer.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: layer.isActive ? 700 : 400,
              color: layer.isActive ? 'var(--color-arcano)' : '#EEF4FC',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {i + 1}. {layer.name}
            </p>
          </div>

          {!layer.isActive && (
            <button
              onClick={() => handleActivate(layer.id)}
              disabled={activating === layer.id}
              title="Ativar layer"
              style={{
                padding: '0.2rem 0.5rem', borderRadius: 3,
                background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.25)',
                color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                fontSize: '0.65rem', cursor: 'pointer', flexShrink: 0,
              }}
            >
              {activating === layer.id ? '…' : 'Ativar'}
            </button>
          )}

          {layer.isActive && (
            <span style={{
              fontSize: '0.6rem', color: 'var(--color-arcano)',
              fontFamily: 'var(--font-ui)', flexShrink: 0,
            }}>
              ● ativo
            </span>
          )}

          <button
            onClick={() => handleDelete(layer)}
            title="Remover layer"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', padding: '0.1rem',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)' }}
          >
            ✕
          </button>
        </div>
      ))}

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
