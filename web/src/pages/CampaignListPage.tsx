import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'

interface CampaignSummary {
  id: string
  gmUserId: string
  title: string
  description: string
  imageUrl: string | null
  inviteCode?: string
  isGm: boolean
  playerCount: number
  createdAt: string
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 4,
      background: 'rgba(10,15,30,0.8)',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
    }}>
      <div style={{ height: 160, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '1rem' }}>
        <div style={{ height: 18, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '80%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
  return (
    <Link to={`/campanha/${campaign.id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        style={{
          borderRadius: 4,
          background: 'rgba(10,15,30,0.9)',
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Image / placeholder */}
        <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: 'rgba(8,12,28,0.8)' }}>
          {campaign.imageUrl ? (
            <img src={campaign.imageUrl} alt={campaign.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(200,146,42,0.08) 0%, rgba(4,6,12,0.9) 100%)',
            }}>
              <span style={{ fontSize: '3rem', opacity: 0.15 }}>⚔️</span>
            </div>
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(4,6,12,0.9) 0%, transparent 60%)',
          }} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: campaign.isGm ? 'rgba(200,146,42,0.2)' : 'rgba(80,200,232,0.15)',
            border: `1px solid ${campaign.isGm ? 'rgba(200,146,42,0.4)' : 'rgba(80,200,232,0.3)'}`,
            color: campaign.isGm ? 'var(--color-arcano)' : '#50C8E8',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '0.2rem 0.5rem',
            borderRadius: 3,
          }}>
            {campaign.isGm ? 'Mestre' : 'Jogador'}
          </span>
        </div>

        <div style={{ padding: '1rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#EEF4FC',
            marginBottom: '0.35rem',
            letterSpacing: '0.02em',
          }}>
            {campaign.title}
          </h3>
          {campaign.description && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {campaign.description}
            </p>
          )}
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.3)',
          }}>
            {campaign.playerCount} jogador{campaign.playerCount !== 1 ? 'es' : ''}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}

function CreateCampaignModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (c: CampaignSummary) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.campaigns.create({ title: title.trim(), description: description.trim() })
      onCreate((res as { campaign: CampaignSummary }).campaign)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4, color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-ui)',
    fontSize: '0.7rem', fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--color-text-muted)', marginBottom: '0.4rem',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0A0F1E',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '1.75rem',
          width: 420,
          maxWidth: 'calc(100vw - 2rem)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#EEF4FC', marginBottom: '1.25rem' }}>
          Nova Campanha
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              required placeholder="Nome da campanha"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.5)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Sinopse ou ambientação da campanha…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.5)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#E07070',
              background: 'rgba(200,60,60,0.1)', border: '1px solid rgba(200,60,60,0.25)',
              borderRadius: 4, padding: '0.5rem 0.75rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '0.5rem 1rem', borderRadius: 4,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving || !title.trim()}
              style={{ padding: '0.5rem 1.25rem', borderRadius: 4, border: 'none',
                background: saving || !title.trim() ? 'rgba(255,255,255,0.05)' : 'var(--color-arcano)',
                color: saving || !title.trim() ? 'rgba(255,255,255,0.2)' : '#0A0A0A',
                fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: saving || !title.trim() ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Criando…' : 'Criar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export function CampaignListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    document.title = 'Campanhas — Arcádia'
    window.scrollTo({ top: 0 })
    if (!user) return
    setLoading(true)
    api.campaigns.list()
      .then(res => setCampaigns((res as { campaigns: CampaignSummary[] }).campaigns))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-abyss)' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(8,18,36,0.9) 0%, var(--color-abyss) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '3rem 2rem 2.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.02, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(90deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px)`,
        }} />
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap relative">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
              style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}>
              Campanhas
            </p>
            <h1 className="font-display font-bold text-4xl mb-3" style={{ color: '#EEF4FC', letterSpacing: '-0.01em' }}>
              Suas Campanhas
            </h1>
            <p className="font-body text-base" style={{ color: 'var(--color-text-secondary)', maxWidth: 480 }}>
              Gerencie suas campanhas como mestre ou veja as que participa como jogador.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.1rem', borderRadius: 4,
                background: 'var(--color-arcano)', border: 'none',
                color: '#0A0A0A', fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              + Nova Campanha
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!user ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Entre na sua conta para ver e criar campanhas.
            </p>
            <button onClick={() => navigate('/login')}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 4,
                background: 'var(--color-arcano)', border: 'none',
                color: '#0A0A0A', fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
              Entrar
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4,
          }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Nenhuma campanha ainda.
            </p>
            <button onClick={() => setShowCreate(true)}
              style={{
                padding: '0.55rem 1.25rem', borderRadius: 4,
                background: 'rgba(200,146,42,0.12)',
                border: '1px solid rgba(200,146,42,0.3)',
                color: 'var(--color-arcano)', fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              }}>
              Criar primeira campanha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateCampaignModal
            onClose={() => setShowCreate(false)}
            onCreate={c => setCampaigns(prev => [{ ...c, isGm: true, playerCount: 0 }, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
