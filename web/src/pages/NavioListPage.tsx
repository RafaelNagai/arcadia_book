import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import shipsData from '@ships'
import type { Ship } from '@/data/shipTypes'
import { normalizeShip } from '@/data/shipTypes'
import type { ApiShip } from '@/data/shipTypes'
import { computeSlotsUsed } from '@/data/shipSectorCatalog'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import { ShipSummaryCard } from '@/components/ship/ShipSummaryCard'
import type { CampaignChar } from '@/data/campaignTypes'

const PRESET_SHIPS = (shipsData as Ship[]).map(normalizeShip)

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

function JoinShipModal({ onClose, onJoined }: { onClose: () => void; onJoined: (shipId: string) => void }) {
  const [characters, setCharacters] = useState<CampaignChar[] | null>(null)
  const [characterId, setCharacterId] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.characters.list()
      .then(res => {
        setCharacters(res.characters)
        if (res.characters[0]) setCharacterId(res.characters[0].id)
      })
      .catch(() => setCharacters([]))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!characterId || !code.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.ships.join(code.trim().toUpperCase(), characterId)
      const membership = (res as { membership: { shipId: string } }).membership
      onJoined(membership.shipId)
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
          padding: '1.75rem', width: 400, maxWidth: 'calc(100vw - 2rem)', boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '1.25rem' }}>
          Entrar em uma Tripulação
        </p>

        {characters !== null && characters.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Você precisa ter uma ficha de personagem para entrar em uma tripulação.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Personagem</label>
              <select value={characterId} onChange={e => setCharacterId(e.target.value)} style={inputStyle}>
                {characters === null && <option>Carregando…</option>}
                {characters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Código de Convite</label>
              <input
                value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                required placeholder="Ex: A1B2C3D4" style={{ ...inputStyle, letterSpacing: '0.15em', textTransform: 'uppercase' }}
              />
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
              <button type="submit" disabled={saving || !characterId || !code.trim()}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: 4, border: 'none',
                  background: saving || !characterId || !code.trim() ? 'rgba(255,255,255,0.05)' : '#50C8E8',
                  color: saving || !characterId || !code.trim() ? 'rgba(255,255,255,0.2)' : '#0A0A0A',
                  fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
                }}>
                {saving ? 'Entrando…' : 'Entrar'}
              </button>
            </div>
          </form>
        )}
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

export function NavioListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [myShips, setMyShips] = useState<ApiShip[]>([])
  const [publicShips, setPublicShips] = useState<ApiShip[]>([])
  const [loadingMine, setLoadingMine] = useState(true)
  const [loadingPublic, setLoadingPublic] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>(() => user ? 'meus' : 'explorar')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

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

  useEffect(() => {
    if (user) setActiveTab('meus')
    else setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)
  }, [user])

  async function confirmDelete() {
    if (!pendingDeleteId) return
    await api.ships.delete(pendingDeleteId)
    setMyShips(prev => prev.filter(s => s.id !== pendingDeleteId))
    setPendingDeleteId(null)
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
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={() => user ? setShowJoin(true) : navigate('/login')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: 4,
                    background: 'rgba(80,200,232,0.1)', border: '1px solid rgba(80,200,232,0.35)', color: '#50C8E8',
                    fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                  🔑 Entrar com Código
                </motion.button>
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

          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
                    <ShipSummaryCard
                      key={ship.id}
                      index={i}
                      to={`/navio/${ship.id}`}
                      ship={{
                        id: ship.id, name: ship.name, subtitle: ship.motto || ship.porte,
                        imageUrl: ship.imageUrl, type: ship.type, hp: ship.hp, currentHp: ship.currentHp,
                        slotsTotal: ship.slotsTotal, slotsUsed: computeSlotsUsed(ship.sectors),
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'arcadia' && (
            <motion.div key="arcadia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRESET_SHIPS.map((ship, i) => (
                  <ShipSummaryCard
                    key={ship.id}
                    index={i}
                    ship={{
                      id: ship.id, name: ship.name, subtitle: `${ship.type} · ${ship.size}`,
                      imageUrl: ship.image, type: ship.size, hp: ship.hp,
                      slotsTotal: ship.slots.total, slotsUsed: ship.slots.used,
                    }}
                  />
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
        {showJoin && (
          <JoinShipModal
            onClose={() => setShowJoin(false)}
            onJoined={shipId => { setShowJoin(false); navigate(`/navio/${shipId}`) }}
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
    </motion.div>
  )
}
