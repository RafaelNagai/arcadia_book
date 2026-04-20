import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import { getAccent } from '@/components/character/types'
import type { CampaignChar, CampaignDetail } from '@/data/campaignTypes'
import { MapTab } from '@/components/map/MapTab'

// ── CharMiniCard ─────────────────────────────────────────────────────────────

function CharMiniCard({ char, canViewSheet, onRemove, isGm, campaignId, view }: {
  char: CampaignChar
  canViewSheet: boolean
  onRemove?: () => void
  isGm: boolean
  campaignId: string
  view: 'players' | 'npcs'
}) {
  const accent = getAccent(char.afinidade)

  return (
    <div style={{
      background: 'rgba(10,15,30,0.9)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: 'rgba(6,10,22,0.8)' }}>
        {char.imageUrl ? (
          <img src={char.imageUrl} alt={char.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(ellipse 80% 80% at 50% 30%, ${accent.text}18 0%, transparent 70%)`,
          }}>
            <span style={{ fontSize: '5rem', opacity: 0.12, fontFamily: 'var(--font-display)', fontWeight: 700, color: accent.text }}>
              {char.name[0]}
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,6,12,0.95) 0%, transparent 50%)' }} />
      </div>

      <div style={{ padding: '0.75rem' }}>
        <span style={{
          display: 'inline-block', fontSize: '0.6rem', fontFamily: 'var(--font-ui)',
          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: accent.text, background: `${accent.text}18`,
          border: `1px solid ${accent.text}44`, borderRadius: 3,
          padding: '0.15rem 0.45rem', marginBottom: '0.4rem',
        }}>
          {char.race}
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '0.15rem' }}>
          {char.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>
          {char.concept || `Nível ${char.level}`}
        </p>

        {canViewSheet ? (
          <Link to={`/ficha/${char.id}`} state={{ fromCampaignId: campaignId, fromCampaignView: view }}
            style={{
              display: 'block', textAlign: 'center',
              padding: '0.4rem', borderRadius: 3,
              background: `${accent.text}12`,
              border: `1px solid ${accent.text}33`,
              color: accent.text, fontFamily: 'var(--font-ui)',
              fontSize: '0.68rem', fontWeight: 600,
              letterSpacing: '0.1em', textDecoration: 'none',
              textTransform: 'uppercase',
            }}>
            Ver ficha
          </Link>
        ) : (
          <div style={{
            textAlign: 'center', padding: '0.4rem', borderRadius: 3,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)',
            fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Ficha privada
          </div>
        )}
      </div>

      {isGm && onRemove && (
        <button
          onClick={onRemove}
          title="Remover da campanha"
          style={{
            position: 'absolute', top: 6, right: 6, zIndex: 10,
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
      )}
    </div>
  )
}

// ── SelectNpcModal ────────────────────────────────────────────────────────────

function SelectNpcModal({ campaignId, existingNpcIds, onClose, onAdd, chars, charsLoading }: {
  campaignId: string
  existingNpcIds: string[]
  onClose: () => void
  onAdd: (char: CampaignChar) => void
  chars: CampaignChar[]
  charsLoading: boolean
}) {
  const navigate = useNavigate()
  const [adding, setAdding] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set(existingNpcIds))

  async function handleAdd(char: CampaignChar) {
    setAdding(char.id)
    try {
      await api.campaigns.addNpc(campaignId, char.id)
      setAddedIds(prev => new Set([...prev, char.id]))
      onAdd(char)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setAdding(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '1.5rem',
          width: 440, maxWidth: 'calc(100vw - 2rem)',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC' }}>
            Adicionar NPC
          </p>
          <button
            onClick={() => { onClose(); navigate(`/criar-ficha?campaignId=${campaignId}`) }}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: 3,
              background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.3)',
              color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
              fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Novo NPC
          </button>
        </div>

        {charsLoading ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Carregando…</p>
        ) : chars.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Nenhum personagem disponível.
          </p>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {chars.map(char => {
              const already = addedIds.has(char.id)
              return (
                <div key={char.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.75rem', borderRadius: 4,
                  background: already ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${already ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {char.imageUrl && (
                      <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 600, color: already ? 'rgba(255,255,255,0.3)' : '#EEF4FC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {char.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {char.race}
                    </p>
                  </div>
                  {already ? (
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                      Adicionado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAdd(char)}
                      disabled={adding === char.id}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: 3,
                        background: 'rgba(200,146,42,0.12)',
                        border: '1px solid rgba(200,146,42,0.3)',
                        color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                        fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {adding === char.id ? '…' : 'Adicionar'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onClose}
          style={{
            marginTop: '1rem', padding: '0.5rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer',
          }}>
          Fechar
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── CampaignSidebar ───────────────────────────────────────────────────────────

type CampaignView = 'players' | 'npcs' | 'mapa'

interface CampaignSidebarProps {
  campaign: CampaignDetail
  view: CampaignView
  isGm: boolean
  onChangeView: (v: CampaignView) => void
  onRegenerateCode: () => void
  onRequestDelete: () => void
  onClose?: () => void
}

function CampaignSidebar({ campaign, view, isGm, onChangeView, onRegenerateCode, onRequestDelete, onClose }: CampaignSidebarProps) {
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!campaign.inviteCode) return
    navigator.clipboard.writeText(campaign.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleNavClick(v: CampaignView) {
    onChangeView(v)
    onClose?.()
  }

  const navItem = (v: CampaignView, label: string, count?: number) => (
    <button
      key={v}
      onClick={() => handleNavClick(v)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '0.65rem 1rem', borderRadius: 4,
        background: view === v ? 'rgba(200,146,42,0.1)' : 'transparent',
        border: view === v ? '1px solid rgba(200,146,42,0.25)' : '1px solid transparent',
        color: view === v ? 'var(--color-arcano)' : 'var(--color-text-muted)',
        fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: view === v ? 700 : 400,
        letterSpacing: '0.06em', cursor: 'pointer', textAlign: 'left',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          fontSize: '0.65rem', fontFamily: 'var(--font-ui)', fontWeight: 600,
          color: view === v ? 'var(--color-arcano)' : 'rgba(255,255,255,0.2)',
          background: view === v ? 'rgba(200,146,42,0.15)' : 'rgba(255,255,255,0.05)',
          padding: '0.1rem 0.45rem', borderRadius: 99,
        }}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Campaign header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        {campaign.imageUrl && (
          <div style={{ height: 72, borderRadius: 4, overflow: 'hidden', marginBottom: '0.75rem' }}>
            <img src={campaign.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '0.35rem' }}>
          {campaign.title}
        </p>
        {isGm && (
          <span style={{
            fontSize: '0.6rem', fontFamily: 'var(--font-ui)', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-arcano)', background: 'rgba(200,146,42,0.15)',
            border: '1px solid rgba(200,146,42,0.3)',
            padding: '0.15rem 0.5rem', borderRadius: 3,
          }}>
            Mestre
          </span>
        )}
      </div>

      {/* Navigation */}
      <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '0.4rem', paddingLeft: '0.25rem' }}>
          Páginas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItem('players', 'Personagens', campaign.players.length)}
          {isGm && navItem('npcs', 'NPCs', campaign.npcs.length)}
          {navItem('mapa', 'Mapa')}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* GM Tools */}
      {isGm && (
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
            Ferramentas
          </p>
          <button onClick={() => setShowInviteCode(v => !v)}
            style={{
              padding: '0.5rem 0.75rem', borderRadius: 4, textAlign: 'left',
              background: showInviteCode ? 'rgba(200,146,42,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showInviteCode ? 'rgba(200,146,42,0.2)' : 'rgba(255,255,255,0.08)'}`,
              color: showInviteCode ? 'var(--color-arcano)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer',
            }}>
            {showInviteCode ? 'Ocultar código' : '🔑 Código de convite'}
          </button>
          {showInviteCode && campaign.inviteCode && (
            <div style={{
              padding: '0.6rem 0.75rem', borderRadius: 4,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-arcano)', textAlign: 'center', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
                {campaign.inviteCode}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={copyCode} style={{
                  flex: 1, padding: '0.3rem', borderRadius: 3,
                  background: copied ? 'rgba(111,200,146,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${copied ? 'rgba(111,200,146,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: copied ? '#6FC892' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'var(--font-ui)', fontSize: '0.65rem', cursor: 'pointer',
                }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
                <button onClick={onRegenerateCode} style={{
                  flex: 1, padding: '0.3rem', borderRadius: 3,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', cursor: 'pointer',
                }}>
                  Regenerar
                </button>
              </div>
            </div>
          )}
          <button onClick={onRequestDelete}
            style={{
              padding: '0.5rem 0.75rem', borderRadius: 4, textAlign: 'left',
              background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.18)',
              color: 'rgba(220,100,100,0.6)', fontFamily: 'var(--font-ui)',
              fontSize: '0.72rem', cursor: 'pointer',
            }}>
            Excluir campanha
          </button>
        </div>
      )}
    </div>
  )
}

// ── CampaignPage ──────────────────────────────────────────────────────────────

export function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const view = (searchParams.get('view') as CampaignView) ?? 'players'

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNpcModal, setShowNpcModal] = useState(false)
  const [npcCandidates, setNpcCandidates] = useState<CampaignChar[] | null>(null)
  const [npcCandidatesLoading, setNpcCandidatesLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.campaigns.get(id)
      .then(res => {
        setCampaign(res.campaign)
        document.title = `${res.campaign.title} — Arcádia`
      })
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [id])

  function openNpcModal() {
    setShowNpcModal(true)
    if (npcCandidates !== null) return
    setNpcCandidatesLoading(true)
    api.characters.list()
      .then(res => setNpcCandidates(res.characters))
      .catch(() => setNpcCandidates([]))
      .finally(() => setNpcCandidatesLoading(false))
  }

  async function handleRemove(charId: string, type: 'players' | 'npcs') {
    if (!id || !campaign) return
    const snapshot = campaign
    setCampaign(prev => {
      if (!prev) return prev
      return {
        ...prev,
        players: type === 'players' ? prev.players.filter(c => c.id !== charId) : prev.players,
        npcs: type === 'npcs' ? prev.npcs.filter(c => c.id !== charId) : prev.npcs,
      }
    })
    try {
      if (type === 'players') {
        await api.campaigns.leave(id, charId)
      } else {
        await api.campaigns.removeNpc(id, charId)
      }
    } catch {
      setCampaign(snapshot)
    }
  }

  async function handleRegenerateCode() {
    if (!id) return
    const res = await api.campaigns.regenerateInviteCode(id)
    setCampaign(prev => prev ? { ...prev, inviteCode: res.inviteCode } : prev)
  }

  async function handleDeleteCampaign() {
    if (!id) return
    setDeleting(true)
    try {
      await api.campaigns.delete(id)
      navigate('/campanhas')
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  function setView(v: CampaignView) {
    setSearchParams({ view: v })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-abyss)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>Carregando…</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-abyss)' }}>
        <div className="text-center space-y-4">
          <p className="font-display text-2xl" style={{ color: 'var(--color-text-secondary)' }}>Campanha não encontrada</p>
          <button onClick={() => navigate('/campanhas')}
            style={{ color: 'var(--color-arcano-glow)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  const isGm = campaign.isGm
  const listView = view === 'mapa' ? 'players' : view
  const currentList = listView === 'players' ? campaign.players : campaign.npcs

  return (
    <div style={{ background: 'var(--color-abyss)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', gap: '1rem',
        background: 'rgba(4,6,12,0.92)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <button onClick={() => navigate('/campanhas')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
          ← Campanhas
        </button>
        <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#EEF4FC', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {campaign.title}
        </p>
        <button className="lg:hidden" onClick={() => setSidebarOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          ☰
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex" style={{
          width: 240, flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          background: 'rgba(6,10,22,0.6)',
          height: 'calc(100vh - 52px)',
          position: 'sticky', top: 52,
          flexDirection: 'column',
        }}>
          <CampaignSidebar
            campaign={campaign}
            view={view}
            isGm={isGm}
            onChangeView={setView}
            onRegenerateCode={handleRegenerateCode}
            onRequestDelete={() => setShowDeleteConfirm(true)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.6)' }} />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{
                  position: 'fixed', top: 52, left: 0, bottom: 0,
                  width: 280, zIndex: 81,
                  background: 'var(--color-deep)',
                  borderRight: '1px solid var(--color-border)',
                }}
              >
                <CampaignSidebar
                  campaign={campaign}
                  view={view}
                  isGm={isGm}
                  onChangeView={setView}
                  onRegenerateCode={handleRegenerateCode}
                  onRequestDelete={() => setShowDeleteConfirm(true)}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        {view === 'mapa' ? (
          <MapTab campaign={campaign} />
        ) : null}
        <div style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto', display: view === 'mapa' ? 'none' : undefined }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)', marginBottom: '0.25rem' }}>
                  {listView === 'players' ? 'Jogadores' : 'NPCs'}
                </p>
                <h2 className="font-display font-bold text-2xl" style={{ color: '#EEF4FC' }}>
                  {listView === 'players'
                    ? `${campaign.players.length} personagem${campaign.players.length !== 1 ? 's' : ''}`
                    : `${campaign.npcs.length} NPC${campaign.npcs.length !== 1 ? 's' : ''}`}
                </h2>
              </div>
              {isGm && listView === 'npcs' && (
                <button onClick={openNpcModal}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.55rem 1rem', borderRadius: 4,
                    background: 'rgba(200,146,42,0.12)', border: '1px solid rgba(200,146,42,0.35)',
                    color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}>
                  + Adicionar NPC
                </button>
              )}
            </div>

            {currentList.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '4rem',
                border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4,
              }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  {listView === 'players'
                    ? 'Nenhum jogador ainda. Compartilhe o código de convite.'
                    : 'Nenhum NPC adicionado ainda.'}
                </p>
                {isGm && listView === 'npcs' && (
                  <button onClick={openNpcModal}
                    style={{
                      padding: '0.5rem 1.25rem', borderRadius: 4,
                      background: 'rgba(200,146,42,0.1)', border: '1px solid rgba(200,146,42,0.3)',
                      color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    }}>
                    + Adicionar NPC
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentList.map(char => (
                  <CharMiniCard
                    key={char.id}
                    char={char}
                    isGm={isGm}
                    campaignId={id!}
                    view={listView}
                    canViewSheet={char.isPublic || char.userId === user?.id || isGm}
                    onRemove={isGm ? () => handleRemove(char.id, listView) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNpcModal && id && campaign && (
          <SelectNpcModal
            campaignId={id}
            existingNpcIds={campaign.npcs.map(n => n.id)}
            onClose={() => setShowNpcModal(false)}
            onAdd={char => setCampaign(prev => prev ? { ...prev, npcs: [...prev.npcs, { ...char, campaignCharacterId: '' }] } : prev)}
            chars={npcCandidates ?? []}
            charsLoading={npcCandidatesLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setShowDeleteConfirm(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0A0F1E', border: '1px solid rgba(200,60,60,0.35)',
                borderRadius: 8, padding: '1.75rem',
                width: 360, maxWidth: 'calc(100vw - 2rem)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '0.5rem' }}>
                Excluir campanha?
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                <span style={{ color: '#EEF4FC', fontWeight: 600 }}>{campaign.title}</span> será removida permanentemente. Os personagens não serão deletados, apenas desvinculados.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                  style={{ padding: '0.45rem 1rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleDeleteCampaign} disabled={deleting}
                  style={{ padding: '0.45rem 1rem', borderRadius: 4, background: 'rgba(200,60,60,0.2)', border: '1px solid rgba(200,60,60,0.55)', color: '#E07070', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                  {deleting ? 'Excluindo…' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
