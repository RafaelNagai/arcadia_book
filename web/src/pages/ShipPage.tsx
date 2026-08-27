import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import type { ApiShip, InstalledSector, MoralAction, ShipStateData } from '@/data/shipTypes'
import type { SectorCategoryKey } from '@/data/shipSectorCatalog'
import { computeShipDn, computeSlotsUsed, findSectorEntry, getCategoryLabel } from '@/data/shipSectorCatalog'
import { useShipRealtime } from '@/hooks/useShipRealtime'
import { ShipCrewPanel } from '@/components/ship/ShipCrewPanel'
import { MoralPotPanel } from '@/components/ship/MoralPotPanel'
import { ShipCodePanel } from '@/components/ship/ShipCodePanel'
import { SectorCatalogModal } from '@/components/ship/SectorCatalogModal'

const ACCENT = '#50C8E8'

function EditableField({ label, value, onSave, textarea, placeholder, numeric, compact }: {
  label: string
  value: string
  onSave: (v: string) => void
  textarea?: boolean
  placeholder?: string
  numeric?: boolean
  compact?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => { setDraft(value) }, [value])

  const inputStyle: React.CSSProperties = compact
    ? {
        width: 48, padding: '0.1rem 0.3rem', textAlign: 'center', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(80,200,232,0.4)', borderRadius: 4, color: '#EEF4FC',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box',
      }
    : {
        width: '100%', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(80,200,232,0.4)', borderRadius: 4, color: '#EEF4FC',
        fontFamily: 'var(--font-ui)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
      }

  if (!editing) {
    if (compact) {
      return (
        <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: '1px dashed rgba(255,255,255,0.25)' }} title={`Editar ${label}`}>
          {value}
        </span>
      )
    }
    return (
      <div onClick={() => setEditing(true)} style={{ cursor: 'pointer' }} title={`Editar ${label}`}>
        {value ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{value}</p>
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
            {placeholder ?? `Adicionar ${label.toLowerCase()}…`}
          </p>
        )}
      </div>
    )
  }

  function commit() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  return textarea ? (
    <textarea
      autoFocus value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
    />
  ) : (
    <input
      autoFocus value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined}
      style={inputStyle}
    />
  )
}

export function ShipPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [ship, setShip] = useState<ApiShip | null>(null)
  const [shipState, setShipState] = useState<ShipStateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSectorModal, setShowSectorModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOwner = !!user && !!ship && ship.userId === user.id
  const isCrewMember = !!user && !!ship?.crew?.some(c => c.userId === user.id)
  const canManageMoral = isOwner || isCrewMember

  const fetchShip = useCallback(() => {
    if (!id) return Promise.resolve(undefined)
    return api.ships.get(id)
      .then(res => {
        setShip(res.ship)
        document.title = `${res.ship.name} — Arcádia`
        return res.ship
      })
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchShip()
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [id, fetchShip])

  useEffect(() => {
    if (!id || !canManageMoral) { setShipState(null); return }
    api.ships.state.get(id).then(res => setShipState(res.state)).catch(() => setShipState(null))
  }, [id, canManageMoral])

  useShipRealtime(id, {
    onShipUpdate: () => { fetchShip().catch(() => {}) },
    onStateUpdate: data => {
      const pool = data.moral_pool as number[] | undefined
      const log = data.moral_log as ShipStateData['moralLog'] | undefined
      if (pool && log) setShipState(prev => prev ? { ...prev, moralPool: pool, moralLog: log } : prev)
    },
    onCrewChange: () => { fetchShip().catch(() => {}) },
  })

  const slotsUsed = useMemo(() => ship ? computeSlotsUsed(ship.sectors) : 0, [ship])
  const dn = useMemo(() => ship ? computeShipDn(ship.sectors) : 5, [ship])

  const sectorsByCategory = useMemo(() => {
    if (!ship) return [] as [SectorCategoryKey, InstalledSector[]][]
    const groups = new Map<SectorCategoryKey, InstalledSector[]>()
    for (const s of ship.sectors) {
      const list = groups.get(s.category) ?? []
      list.push(s)
      groups.set(s.category, list)
    }
    return Array.from(groups.entries())
  }, [ship])

  async function patchShip(patch: Record<string, unknown>) {
    if (!id) return
    const res = await api.ships.update(id, patch)
    setShip(prev => ({ ...res.ship, crew: prev?.crew }))
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    try {
      const { url } = await api.upload.shipImage(id, file)
      await patchShip({ image_url: url })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  async function handleToggleVisibility() {
    if (!id || !ship) return
    const res = await api.ships.setVisibility(id, !ship.isPublic)
    setShip(prev => ({ ...res.ship, crew: prev?.crew }))
  }

  async function handleRegenerateCode() {
    if (!id) return
    const res = await api.ships.regenerateCode(id)
    setShip(prev => prev ? { ...prev, crewCode: res.crewCode } : prev)
  }

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    try {
      await api.ships.delete(id)
      navigate('/navios')
    } catch (err) {
      alert((err as Error).message)
      setDeleting(false)
    }
  }

  async function handleInstallSector(category: SectorCategoryKey, key: string) {
    if (!ship || !id) return
    const entry = findSectorEntry(category, key)
    if (!entry) return
    if (slotsUsed + entry.slots > ship.slotsTotal) return
    const next: InstalledSector[] = [...ship.sectors, { id: crypto.randomUUID(), category, key }]
    await patchShip({ sectors: next })
  }

  async function handleRemoveSector(instanceId: string) {
    if (!ship) return
    const next = ship.sectors.filter(s => s.id !== instanceId)
    await patchShip({ sectors: next })
  }

  async function handleCurrentHpChange(value: number) {
    if (!id) return
    const res = await api.ships.updateCurrentHp(id, value)
    setShip(prev => ({ ...res.ship, crew: prev?.crew }))
  }

  async function handleSlotsTotalChange(v: string) {
    const n = Math.max(0, Math.round(Number(v)) || 0)
    if (n < slotsUsed) {
      alert(`Slots Totais não pode ser menor que os ${slotsUsed} slots já usados pelos setores instalados.`)
      return
    }
    await patchShip({ slots_total: n })
  }

  async function handleHpChange(v: string) {
    const n = Math.max(0, Math.round(Number(v)) || 0)
    await patchShip({ hp: n })
  }

  async function handleRemoveCrew(characterId: string) {
    if (!id) return
    await api.ships.leave(id, characterId)
    fetchShip().catch(() => {})
  }

  async function handleMoralAction(action: MoralAction) {
    if (!id) return
    const res = await api.ships.state.mutateMoral(id, action)
    setShipState(res.state)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-abyss)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)' }}>Carregando navio…</p>
      </div>
    )
  }

  if (error || !ship) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-abyss)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: '#E07070' }}>{error ?? 'Navio não encontrado'}</p>
        <Link to="/navios" style={{ color: ACCENT, fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>← Voltar para Navios</Link>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="min-h-screen" style={{ background: 'var(--color-abyss)' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        {ship.imageUrl ? (
          <img src={ship.imageUrl} alt={ship.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `radial-gradient(ellipse 80% 80% at 50% 20%, rgba(80,200,232,0.14) 0%, transparent 70%),
                         linear-gradient(180deg, rgba(8,18,36,0.9) 0%, var(--color-abyss) 100%)`,
          }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-abyss) 0%, rgba(4,10,20,0.3) 55%, rgba(4,10,20,0.55) 100%)' }} />

        <Link to="/navios" style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem',
          letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none',
        }}>
          ← Navios
        </Link>

        {isOwner && (
          <>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              padding: '0.4rem 0.8rem', borderRadius: 4, background: 'rgba(4,10,20,0.7)',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
              fontFamily: 'var(--font-ui)', fontSize: '0.68rem', cursor: 'pointer',
            }}>
              📷 Alterar imagem
            </button>
          </>
        )}

        <div className="max-w-5xl mx-auto" style={{ position: 'absolute', left: 0, right: 0, bottom: '1.5rem', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.62rem', fontFamily: 'var(--font-ui)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: ACCENT, background: 'rgba(80,200,232,0.15)', border: '1px solid rgba(80,200,232,0.35)', padding: '0.15rem 0.5rem', borderRadius: 3,
            }}>
              {ship.type === 'Organico' ? 'Orgânico' : 'Material'}
            </span>
            {ship.porte && (
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-ui)', color: 'rgba(255,255,255,0.5)' }}>{ship.porte}</span>
            )}
            {isOwner && (
              <button onClick={handleToggleVisibility} style={{
                marginLeft: 'auto', fontSize: '0.62rem', fontFamily: 'var(--font-ui)', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '0.15rem 0.55rem', borderRadius: 3, cursor: 'pointer',
                background: ship.isPublic ? 'rgba(111,200,146,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${ship.isPublic ? 'rgba(111,200,146,0.4)' : 'rgba(255,255,255,0.14)'}`,
                color: ship.isPublic ? '#6FC892' : 'rgba(255,255,255,0.5)',
              }}>
                {ship.isPublic ? '🌐 Público' : '🔒 Privado'}
              </button>
            )}
          </div>
          <h1 className="font-display font-bold text-4xl" style={{ color: '#EEF4FC', letterSpacing: '-0.01em' }}>
            {ship.name}
          </h1>
          {ship.motto && (
            <p className="font-body italic" style={{ color: 'var(--color-text-secondary)', marginTop: '0.35rem', fontSize: '1rem' }}>
              “{ship.motto}”
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'DN', value: dn },
              { label: 'Slots', value: `${slotsUsed}/${ship.slotsTotal}` },
              { label: 'Vida', value: null },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6,
                padding: '0.9rem', textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.35rem' }}>
                  {stat.label}
                </p>
                {stat.label === 'Vida' ? (
                  canManageMoral ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <input
                        type="number" min={0} defaultValue={ship.currentHp ?? ship.hp}
                        onBlur={e => {
                          const v = Math.max(0, Number(e.target.value) || 0)
                          if (v !== (ship.currentHp ?? ship.hp)) handleCurrentHpChange(v)
                        }}
                        style={{ width: 48, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: '#EEF4FC', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}
                      />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#EEF4FC' }}>
                        / {isOwner ? (
                          <EditableField label="Vida Máxima" value={String(ship.hp)} onSave={handleHpChange} numeric compact />
                        ) : ship.hp}
                      </span>
                    </div>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: '#EEF4FC' }}>
                      {ship.currentHp ?? ship.hp}/{ship.hp}
                    </p>
                  )
                ) : stat.label === 'Slots' ? (
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: '#EEF4FC' }}>
                    {slotsUsed}/{isOwner ? (
                      <EditableField label="Slots Totais" value={String(ship.slotsTotal)} onSave={handleSlotsTotalChange} numeric compact />
                    ) : ship.slotsTotal}
                  </p>
                ) : (
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: '#EEF4FC' }}>
                    {stat.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>
              Descrição
            </p>
            {isOwner ? (
              <EditableField label="Descrição" value={ship.description} onSave={v => patchShip({ description: v })} textarea />
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                {ship.description || '—'}
              </p>
            )}
            {isOwner && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '0.3rem' }}>Lema</p>
                  <EditableField label="Lema" value={ship.motto} onSave={v => patchShip({ motto: v })} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '0.3rem' }}>Porte</p>
                  <EditableField label="Porte" value={ship.porte} onSave={v => patchShip({ porte: v })} />
                </div>
              </div>
            )}
          </div>

          {/* Sectors */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                Setores ({slotsUsed}/{ship.slotsTotal})
              </p>
              {isOwner && (
                <button onClick={() => setShowSectorModal(true)} style={{
                  padding: '0.35rem 0.75rem', borderRadius: 4, background: 'rgba(80,200,232,0.12)',
                  border: '1px solid rgba(80,200,232,0.35)', color: ACCENT, fontFamily: 'var(--font-ui)',
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  Gerenciar Setores
                </button>
              )}
            </div>

            {ship.sectors.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Nenhum setor instalado.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sectorsByCategory.map(([category, sectors]) => (
                  <div key={category}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '0.35rem' }}>
                      {getCategoryLabel(category)}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {sectors.map(s => {
                        const entry = findSectorEntry(s.category, s.key)
                        return (
                          <div key={s.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
                            padding: '0.55rem 0.75rem', borderRadius: 4, background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)',
                          }}>
                            <div>
                              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700, color: '#EEF4FC' }}>
                                {entry?.name ?? s.key}
                              </p>
                              {entry && (
                                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.66rem', color: ACCENT }}>
                                  {entry.effect} · {entry.slots} slot{entry.slots !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            {isOwner && (
                              <button onClick={() => handleRemoveSector(s.id)} style={{
                                background: 'none', border: '1px solid rgba(200,60,60,0.3)', borderRadius: 3,
                                color: '#E07070', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', cursor: 'pointer',
                              }}>
                                Remover
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Crew */}
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>
              Tripulação
            </p>
            <ShipCrewPanel
              crew={ship.crew ?? []}
              currentUserId={user?.id}
              isOwner={isOwner}
              onRemove={handleRemoveCrew}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isOwner && ship.crewCode && (
            <ShipCodePanel crewCode={ship.crewCode} onRegenerate={handleRegenerateCode} />
          )}

          {canManageMoral ? (
            <MoralPotPanel state={shipState} canEdit={canManageMoral} onAction={handleMoralAction} />
          ) : (
            <div style={{ padding: '1rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                O Pote de Moral é visível apenas para a tripulação.
              </p>
            </div>
          )}

          {isOwner && (
            <button onClick={() => setShowDeleteConfirm(true)} style={{
              padding: '0.5rem 0.75rem', borderRadius: 4, textAlign: 'left',
              background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.18)',
              color: 'rgba(220,100,100,0.6)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer',
            }}>
              Excluir navio
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSectorModal && (
          <SectorCatalogModal
            installed={ship.sectors}
            slotsUsed={slotsUsed}
            slotsTotal={ship.slotsTotal}
            onClose={() => setShowSectorModal(false)}
            onInstall={handleInstallSector}
            onRemove={handleRemoveSector}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{ background: '#0A0F1E', border: '1px solid rgba(200,60,60,0.35)', borderRadius: 8, padding: '1.75rem', width: 380, maxWidth: 'calc(100vw - 2rem)', boxShadow: '0 24px 64px rgba(0,0,0,0.85)' }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '0.5rem' }}>
                Excluir {ship.name}?
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                A tripulação será desvinculada e a imagem será removida do armazenamento. Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button disabled={deleting} onClick={() => setShowDeleteConfirm(false)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.1em', padding: '0.45rem 1rem', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button disabled={deleting} onClick={handleDelete}
                  style={{ background: 'rgba(200,60,60,0.2)', border: '1px solid rgba(200,60,60,0.55)', borderRadius: 4, color: '#E07070', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.45rem 1rem', cursor: deleting ? 'not-allowed' : 'pointer' }}>
                  {deleting ? 'Excluindo…' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
