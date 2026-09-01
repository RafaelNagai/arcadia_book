import { useState } from 'react'
import { motion } from 'framer-motion'
import { SECTOR_CATALOG, getSectorTestLabel, type SectorCategoryKey } from '@/data/shipSectorCatalog'
import type { InstalledSector } from '@/data/shipTypes'

export function SectorCatalogModal({ installed, slotsUsed, slotsTotal, onClose, onInstall, onRemove }: {
  installed: InstalledSector[]
  slotsUsed: number
  slotsTotal: number
  onClose: () => void
  onInstall: (category: SectorCategoryKey, key: string) => void
  onRemove: (instanceId: string) => void
}) {
  const [openCategory, setOpenCategory] = useState<SectorCategoryKey | null>('casco')
  const slotsRemaining = slotsTotal - slotsUsed

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', padding: '2rem 1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          width: 640, maxWidth: '100%', maxHeight: 'calc(100dvh - 4rem)', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#EEF4FC' }}>
              Setores
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {slotsUsed}/{slotsTotal} slots usados
              {slotsRemaining <= 0 && <span style={{ color: '#E87A50' }}> · sem slots livres</span>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '0.75rem 1rem', flex: 1, minHeight: 0 }}>
          {SECTOR_CATALOG.map(category => {
            const isOpen = openCategory === category.key
            const installedCount = installed.filter(s => s.category === category.key).length
            return (
              <div key={category.key} style={{ marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenCategory(isOpen ? null : category.key)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.65rem 0.85rem', background: isOpen ? 'rgba(80,200,232,0.06)' : 'rgba(255,255,255,0.02)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 700, color: isOpen ? '#50C8E8' : '#EEF4FC' }}>
                    {category.label}
                    {installedCount > 0 && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                        ({installedCount} instalado{installedCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div style={{ padding: '0.5rem 0.85rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {category.entries.map(entry => {
                      const count = installed.filter(s => s.category === category.key && s.key === entry.key).length
                      const canInstall = slotsRemaining >= entry.slots
                      const testLabel = getSectorTestLabel(entry)
                      return (
                        <div key={entry.key} style={{
                          display: 'flex', justifyContent: 'space-between', gap: '0.75rem',
                          padding: '0.6rem 0.7rem', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700, color: '#EEF4FC' }}>
                              {entry.name}
                              {count > 0 && <span style={{ color: '#50C8E8', fontSize: '0.65rem', marginLeft: '0.4rem' }}>×{count}</span>}
                            </p>
                            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: '#50C8E8', marginTop: '0.15rem' }}>
                              {entry.effect} · {entry.slots} slot{entry.slots !== 1 ? 's' : ''}
                              {testLabel && ` · Teste: ${testLabel}`}
                            </p>
                            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                              {entry.description}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
                            <button
                              disabled={!canInstall}
                              onClick={() => onInstall(category.key, entry.key)}
                              style={{
                                padding: '0.3rem 0.6rem', borderRadius: 3, fontSize: '0.65rem', fontFamily: 'var(--font-ui)', fontWeight: 700,
                                letterSpacing: '0.05em', textTransform: 'uppercase', cursor: canInstall ? 'pointer' : 'not-allowed',
                                background: canInstall ? 'rgba(80,200,232,0.14)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${canInstall ? 'rgba(80,200,232,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                color: canInstall ? '#50C8E8' : 'rgba(255,255,255,0.2)',
                              }}
                            >
                              Instalar
                            </button>
                            {count > 0 && (
                              <button
                                onClick={() => {
                                  const instance = [...installed].reverse().find(s => s.category === category.key && s.key === entry.key)
                                  if (instance) onRemove(instance.id)
                                }}
                                style={{
                                  padding: '0.3rem 0.6rem', borderRadius: 3, fontSize: '0.65rem', fontFamily: 'var(--font-ui)',
                                  letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
                                  background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.25)', color: '#E07070',
                                }}
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
