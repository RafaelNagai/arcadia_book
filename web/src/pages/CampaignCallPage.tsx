import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/apiClient'
import type { CampaignDetail } from '@/data/campaignTypes'
import { CallTab } from '@/components/call/CallTab'

export function CampaignCallPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.campaigns.get(id)
      .then(res => {
        setCampaign(res.campaign)
        document.title = `Chamada — ${res.campaign.title} — Arcádia`
      })
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-abyss)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Carregando…
        </p>
      </div>
    )
  }

  if (!campaign || !id) {
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

  return (
    <div style={{ background: 'var(--color-abyss)', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: 52, display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', gap: '1rem',
        background: 'rgba(4,6,12,0.92)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <button onClick={() => navigate(`/campanha/${id}`)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
          ← Voltar à campanha
        </button>
        <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#EEF4FC', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {campaign.title}
        </p>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <CallTab campaign={campaign} />
      </div>
    </div>
  )
}
