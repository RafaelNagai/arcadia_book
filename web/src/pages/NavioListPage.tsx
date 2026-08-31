import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import shipsData from '@ships'
import type { Ship, NormalizedShip } from '@/data/shipTypes'
import { normalizeShip } from '@/data/shipTypes'
import type { ApiShip } from '@/data/shipTypes'
import { computeSlotsUsed } from '@/data/shipSectorCatalog'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import { ShipSummaryCard } from '@/components/ship/ShipSummaryCard'

const PRESET_SHIPS = (shipsData as Ship[]).map(normalizeShip)

function isPresetShip(ship: ApiShip | NormalizedShip): ship is NormalizedShip {
  return 'lore' in ship
}

function deriveShipKind(type: string): 'Material' | 'Organico' {
  return /^org/i.test(type) ? 'Organico' : 'Material'
}

const SHIP_TYPES: { value: 'Material' | 'Organico'; label: string }[] = [
  { value: 'Material', label: 'Material' },
  { value: 'Organico', label: 'Orgânico' },
]

function ShipSkeletonCard() {
  return (
    <div style={{
      borderRadius: 4, background: '#0D1528', border: '1px solid rgba(80,200,232,0.25)',
      overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        height: 200,
        background: 'linear-gradient(160deg, rgba(80,200,232,0.18) 0%, rgba(80,200,232,0.06) 100%)',
        animation: 'shipskpulse 1.6s ease-in-out infinite', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, #0D1528 0%, transparent 100%)',
        }} />
      </div>
      <div style={{ padding: '1rem 1.25rem 1.5rem', marginTop: '-2rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ height: 16, width: 72, borderRadius: 3, background: 'rgba(80,200,232,0.2)', animation: 'shipskpulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: 24, width: '72%', borderRadius: 4, background: 'rgba(80,200,232,0.3)', animation: 'shipskpulse 1.6s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '55%', borderRadius: 4, background: 'rgba(80,200,232,0.15)', animation: 'shipskpulse 1.6s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

function CreateShipModal({ onClose, onCreated }: { onClose: () => void; onCreated: (ship: ApiShip) => void }) {
  const [name, setName] = useState('')
  const [motto, setMotto] = useState('')
  const [type, setType] = useState<'Material' | 'Organico'>('Material')
  const [porte, setPorte] = useState('')
  const [slotsTotal, setSlotsTotal] = useState(7)
  const [hp, setHp] = useState(7)
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.ships.create({
        name: name.trim(),
        motto: motto.trim(),
        type,
        porte: porte.trim(),
        description: description.trim(),
        slots_total: slotsTotal,
        hp,
      })
      let ship = res.ship
      if (imageFile) {
        try {
          const { url } = await api.upload.shipImage(ship.id, imageFile)
          const updated = await api.ships.update(ship.id, { image_url: url })
          ship = updated.ship
        } catch {
          // image upload failed, ship still created without image
        }
      }
      onCreated(ship)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4, color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-ui)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          padding: '1.75rem', width: 460, maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '1.25rem' }}>
          Novo Navio
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nome *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Nome do navio" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Lema</label>
            <input value={motto} onChange={e => setMotto(e.target.value)} placeholder="O lema da tripulação" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as 'Material' | 'Organico')} style={inputStyle}>
                {SHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Porte</label>
              <input value={porte} onChange={e => setPorte(e.target.value)} placeholder="Ex: Corveta" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Slots Totais</label>
              <input
                type="number" min={1} value={slotsTotal}
                onChange={e => setSlotsTotal(Math.max(0, Math.round(Number(e.target.value)) || 0))}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Vida</label>
              <input
                type="number" min={1} value={hp}
                onChange={e => setHp(Math.max(0, Math.round(Number(e.target.value)) || 0))}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Aparência, história, particularidades…" rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={labelStyle}>Imagem</label>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', height: 120, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: 72, cursor: 'pointer', color: 'var(--color-text-muted)', border: '1px dashed rgba(255,255,255,0.14)' }}>
                <span style={{ fontSize: '1.1rem', opacity: 0.5 }}>+</span>
                <span style={{ fontSize: '0.78rem' }}>Adicionar imagem</span>
              </button>
            )}
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#E07070', background: 'rgba(200,60,60,0.1)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: 4, padding: '0.5rem 0.75rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '0.5rem 1rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || !name.trim()}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: 4, border: 'none',
                background: saving || !name.trim() ? 'rgba(255,255,255,0.05)' : '#50C8E8',
                color: saving || !name.trim() ? 'rgba(255,255,255,0.2)' : '#0A0A0A',
                fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
              }}>
              {saving ? 'Criando…' : 'Criar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

type TabId = 'meus' | 'explorar' | 'arcadia'

const TABS: { id: TabId; label: string }[] = [
  { id: 'meus', label: 'Meus Navios' },
  { id: 'explorar', label: 'Explorar' },
  { id: 'arcadia', label: 'Arcádia' },
]

const SHIP_TAB_STORAGE_KEY = 'arcadia_ship_list_tab'

function readStoredShipTab(): TabId | null {
  try {
    const stored = sessionStorage.getItem(SHIP_TAB_STORAGE_KEY)
    if (stored === 'meus' || stored === 'explorar' || stored === 'arcadia') return stored
  } catch {
    // sessionStorage indisponível (ex: modo privado)
  }
  return null
}

export function NavioListPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [myShips, setMyShips] = useState<ApiShip[]>([])
  const [publicShips, setPublicShips] = useState<ApiShip[]>([])
  const [loadingMine, setLoadingMine] = useState(true)
  const [loadingPublic, setLoadingPublic] = useState(true)
  const usedStoredTab = useRef(false)
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const stored = readStoredShipTab()
    if (stored) {
      usedStoredTab.current = true
      return stored
    }
    return user ? 'meus' : 'explorar'
  })
  const [showCreate, setShowCreate] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingDuplicateShip, setPendingDuplicateShip] = useState<ApiShip | NormalizedShip | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const hasSettledAuthTab = useRef(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = '@keyframes shipskpulse{0%,100%{opacity:1}50%{opacity:0.3}}'
    document.head.appendChild(el)
    styleRef.current = el
    return () => { el.remove() }
  }, [])

  useEffect(() => {
    document.title = 'Navios — Arcádia'
    window.scrollTo({ top: 0 })

    if (user) {
      setLoadingMine(true)
      api.ships.list()
        .then(res => setMyShips(res.ships))
        .catch(() => setMyShips([]))
        .finally(() => setLoadingMine(false))
    } else {
      setMyShips([])
      setLoadingMine(false)
    }

    setLoadingPublic(true)
    api.ships.listPublic()
      .then(res => setPublicShips(res.ships))
      .catch(() => setPublicShips([]))
      .finally(() => setLoadingPublic(false))
  }, [user])

  // wait out AuthProvider's initial getSession() resolution (authLoading); the
  // lazy useState initializer above always runs before that resolves (user is
  // still null there even for an already-logged-in session, e.g. on F5). So on
  // the first settle we don't blindly force a tab: if a tab was restored from
  // sessionStorage we only correct it if it turns out wrong (stuck on 'meus'
  // while actually logged out) — otherwise we trust it, including 'meus'
  // resolving true once the real user loads in. With no stored preference we
  // compute the tab fresh from the resolved user. Transitions observed after
  // that first settle are treated as real login/logout events.
  useEffect(() => {
    if (authLoading) return
    if (!hasSettledAuthTab.current) {
      hasSettledAuthTab.current = true
      if (usedStoredTab.current) {
        setActiveTab(prev => (prev === 'meus' && !user) ? 'explorar' : prev)
      } else {
        setActiveTab(user ? 'meus' : 'explorar')
      }
      return
    }
    if (user) setActiveTab('meus')
    else setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)
  }, [user, authLoading])

  useEffect(() => {
    try {
      sessionStorage.setItem(SHIP_TAB_STORAGE_KEY, activeTab)
    } catch {
      // sessionStorage indisponível (ex: modo privado)
    }
  }, [activeTab])

  async function confirmDelete() {
    if (!pendingDeleteId) return
    await api.ships.delete(pendingDeleteId)
    setMyShips(prev => prev.filter(s => s.id !== pendingDeleteId))
    setPendingDeleteId(null)
  }

  async function handleDuplicate(ship: ApiShip | NormalizedShip) {
    if (duplicatingId) return
    setDuplicatingId(ship.id)
    try {
      if (!isPresetShip(ship)) {
        const res = await api.ships.duplicate(ship.id)
        setMyShips(prev => [res.ship, ...prev])
      } else {
        const res = await api.ships.create({
          name: `Cópia de ${ship.name}`,
          porte: ship.size,
          hp: ship.hp,
          slots_total: ship.slots.total,
          description: ship.lore,
          type: deriveShipKind(ship.type),
          is_public: false,
          sectors: [],
        })
        let newShip = res.ship
        if (ship.image) {
          try {
            const imgRes = await fetch(ship.image)
            const blob = await imgRes.blob()
            const ext = ship.image.split('.').pop()?.split('?')[0] ?? 'jpg'
            const file = new File([blob], `cover.${ext}`, { type: blob.type || 'image/jpeg' })
            const { url } = await api.upload.shipImage(newShip.id, file)
            const updated = await api.ships.update(newShip.id, { image_url: url })
            newShip = updated.ship
          } catch {
            // image upload failed, ship still created without image
          }
        }
        setMyShips(prev => [newShip, ...prev])
      }
      setActiveTab('meus')
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setDuplicatingId(null)
    }
  }

  const pendingShip = myShips.find(s => s.id === pendingDeleteId)
  const visibleTabs = user ? TABS : TABS.filter(t => t.id !== 'meus')

  const counts: Record<TabId, number | null> = {
    meus: loadingMine ? null : myShips.length,
    explorar: loadingPublic ? null : publicShips.length,
    arcadia: PRESET_SHIPS.length,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="min-h-screen" style={{ background: 'var(--color-abyss)' }}>

      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, rgba(8,18,36,0.9) 0%, var(--color-abyss) 100%)',
        borderBottom: '1px solid var(--color-border)', padding: '4rem 2rem 0',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: `repeating-linear-gradient(0deg, #50C8E8 0px, #50C8E8 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(90deg, #50C8E8 0px, #50C8E8 1px, transparent 1px, transparent 60px)`,
          pointerEvents: 'none',
        }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-1.5 mb-4 transition-opacity duration-200 hover:opacity-80"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
                ← Início
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: '#3E9DBF', fontFamily: 'var(--font-ui)' }}>
                Navio e Tripulação
              </p>
              <h1 className="font-display font-bold text-4xl mb-3" style={{ color: '#EEF4FC', letterSpacing: '-0.01em' }}>
                Navios
              </h1>
              <p className="font-body text-base" style={{ color: 'var(--color-text-secondary)', maxWidth: 520 }}>
                A embarcação que carrega sua tripulação pelo Mar de Nuvens.
              </p>
            </div>

            {activeTab === 'meus' && (
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={() => user ? setShowCreate(true) : navigate('/login')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: 4,
                    background: '#50C8E8', border: 'none', color: '#0A0A0A', fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                  + Criar Navio
                </motion.button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            {visibleTabs.map(tab => {
              const isActive = activeTab === tab.id
              const count = counts[tab.id]
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: 'relative', padding: '0.75rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: isActive ? 700 : 400,
                    letterSpacing: '0.06em', color: isActive ? '#50C8E8' : 'var(--color-text-muted)',
                    transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
                  }}>
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: 10,
                      background: isActive ? 'rgba(80,200,232,0.18)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#50C8E8' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s',
                    }}>
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div layoutId="ship-tab-indicator"
                      style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#50C8E8', borderRadius: '2px 2px 0 0' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'meus' && (
            <motion.div key="meus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              {loadingMine ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => <ShipSkeletonCard key={i} />)}
                </div>
              ) : myShips.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#EEF4FC', marginBottom: '0.5rem' }}>
                    Nenhum navio ainda
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                    Construa seu navio e reúna sua tripulação.
                  </p>
                  <button onClick={() => setShowCreate(true)}
                    style={{ padding: '0.55rem 1.1rem', borderRadius: 4, background: '#50C8E8', border: 'none', color: '#0A0A0A', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    + Criar Navio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myShips.map((ship, i) => (
                    <div key={ship.id} style={{ position: 'relative' }}>
                      <ShipSummaryCard
                        index={i}
                        to={`/navio/${ship.id}`}
                        ship={{
                          id: ship.id, name: ship.name, subtitle: ship.motto || ship.porte,
                          imageUrl: ship.imageUrl, type: ship.type, hp: ship.hp, currentHp: ship.currentHp,
                          slotsTotal: ship.slotsTotal, slotsUsed: computeSlotsUsed(ship.sectors),
                        }}
                      />
                      <button
                        onClick={() => setPendingDeleteId(ship.id)}
                        title="Excluir navio"
                        style={{
                          position: 'absolute', top: 8, right: 8, zIndex: 10,
                          background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 4, padding: '0.2rem 0.45rem', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
                          backdropFilter: 'blur(4px)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'explorar' && (
            <motion.div key="explorar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              {loadingPublic ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <ShipSkeletonCard key={i} />)}
                </div>
              ) : publicShips.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem' }}>
                    Nenhum navio público disponível ainda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {publicShips.map((ship, i) => (
                    <div key={ship.id} style={{ position: 'relative' }}>
                      <ShipSummaryCard
                        index={i}
                        to={`/navio/${ship.id}`}
                        ship={{
                          id: ship.id, name: ship.name, subtitle: ship.motto || ship.porte,
                          imageUrl: ship.imageUrl, type: ship.type, hp: ship.hp, currentHp: ship.currentHp,
                          slotsTotal: ship.slotsTotal, slotsUsed: computeSlotsUsed(ship.sectors),
                        }}
                      />
                      {user && (
                        <button
                          onClick={() => setPendingDuplicateShip(ship)}
                          disabled={duplicatingId === ship.id}
                          title="Duplicar navio"
                          style={{
                            position: 'absolute', top: 8, right: 8, zIndex: 10,
                            background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 4, padding: '0.2rem 0.45rem', cursor: duplicatingId === ship.id ? 'not-allowed' : 'pointer',
                            color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
                            backdropFilter: 'blur(4px)',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#50C8E8' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
                        >
                          {duplicatingId === ship.id ? '…' : '⎘'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'arcadia' && (
            <motion.div key="arcadia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRESET_SHIPS.map((ship, i) => (
                  <div key={ship.id} style={{ position: 'relative' }}>
                    <ShipSummaryCard
                      index={i}
                      to={`/navio/arcadia/${ship.id}`}
                      ship={{
                        id: ship.id, name: ship.name, subtitle: `${ship.type} · ${ship.size}`,
                        imageUrl: ship.image, type: ship.size, hp: ship.hp,
                        slotsTotal: ship.slots.total, slotsUsed: ship.slots.used,
                      }}
                    />
                    {user && (
                      <button
                        onClick={() => setPendingDuplicateShip(ship)}
                        disabled={duplicatingId === ship.id}
                        title="Duplicar navio"
                        style={{
                          position: 'absolute', top: 8, right: 8, zIndex: 10,
                          background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 4, padding: '0.2rem 0.45rem', cursor: duplicatingId === ship.id ? 'not-allowed' : 'pointer',
                          color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
                          backdropFilter: 'blur(4px)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#50C8E8' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
                      >
                        {duplicatingId === ship.id ? '…' : '⎘'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateShipModal
            onClose={() => setShowCreate(false)}
            onCreated={ship => { setShowCreate(false); navigate(`/navio/${ship.id}`) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDeleteId && pendingShip && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            onClick={() => setPendingDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{ background: '#0A0F1E', border: '1px solid rgba(200,60,60,0.35)', borderRadius: 8, padding: '1.75rem', width: 360, maxWidth: 'calc(100vw - 2rem)', boxShadow: '0 24px 64px rgba(0,0,0,0.85)' }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '0.5rem' }}>
                Excluir navio?
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                <span style={{ color: '#EEF4FC', fontWeight: 600 }}>{pendingShip.name}</span>
                {' '}será removido permanentemente, junto com a tripulação vinculada. Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setPendingDeleteId(null)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.1em', padding: '0.45rem 1rem', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={confirmDelete}
                  style={{ background: 'rgba(200,60,60,0.2)', border: '1px solid rgba(200,60,60,0.55)', borderRadius: 4, color: '#E07070', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.45rem 1rem', cursor: 'pointer' }}>
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDuplicateShip && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            onClick={() => setPendingDuplicateShip(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{ background: '#0A0F1E', border: '1px solid rgba(80,200,232,0.3)', borderRadius: 8, padding: '1.75rem', width: 360, maxWidth: 'calc(100vw - 2rem)', boxShadow: '0 24px 64px rgba(0,0,0,0.85)' }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '0.5rem' }}>
                Duplicar navio?
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Uma cópia de <span style={{ color: '#EEF4FC', fontWeight: 600 }}>{pendingDuplicateShip.name}</span> será criada nos seus navios.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setPendingDuplicateShip(null)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.1em', padding: '0.45rem 1rem', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={() => { const s = pendingDuplicateShip; setPendingDuplicateShip(null); handleDuplicate(s) }}
                  style={{ background: 'rgba(80,200,232,0.15)', border: '1px solid rgba(80,200,232,0.45)', borderRadius: 4, color: '#50C8E8', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.45rem 1rem', cursor: 'pointer' }}>
                  Duplicar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
