import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import { CreatureDetails } from '@/components/creature/CreatureDetails'
import { FloatingDiceButton } from '@/components/character/FloatingDiceButton'
import { DiceLogSidebar } from '@/components/character/DiceLogSidebar'
import { DiceLogProvider } from '@/lib/diceLog'
import type { CustomCreature } from '@/data/creatureTypes'
import {
  CREATURE_ACCENT,
  CREATURE_ACCENT_DIM,
  CREATURE_ACCENT_GLOW,
  CREATURE_CARD_BG,
  getCreatureStyles,
} from '@/components/creature/constants'

export function CustomCreaturePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [creature, setCreature] = useState<CustomCreature | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { scrollY } = useScroll()
  const heroImgY = useTransform(scrollY, [0, 900], [0, -220])
  const heroContentY = useTransform(scrollY, [0, 600], [0, 90])
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0])
  const hintOpacity = useTransform(scrollY, [0, 180], [0.65, 0])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (!id) return
    setLoading(true)
    api.customCreatures.get(id)
      .then(res => {
        setCreature(res.creature)
        document.title = `${res.creature.name} — Bestiário Arcádia`
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!creature) return
    setDeleting(true)
    try {
      await api.customCreatures.delete(creature.id)
      navigate('/criaturas')
    } catch (err) {
      setError((err as Error).message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-void)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
          Carregando...
        </p>
      </div>
    )
  }

  if (error || !creature) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-void)' }}>
        <p style={{ fontFamily: 'var(--font-display)', color: '#F0D0C0', fontSize: '1.25rem' }}>
          {error ?? 'Criatura não encontrada'}
        </p>
        <button
          onClick={() => navigate('/criaturas')}
          style={{ background: 'none', border: 'none', color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)', fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ← Voltar ao Bestiário
        </button>
      </div>
    )
  }

  const isOwner = user?.id === creature.userId
  const displayImage = creature.imageUrl ?? creature.image
  const styles = getCreatureStyles(creature.style)

  return (
    <DiceLogProvider>
      <div className="min-h-screen" style={{ background: 'var(--color-void)' }}>
        {/* ── HERO ───────────────────────────────────────────────── */}
        <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
          <motion.div
            style={{ y: heroImgY, position: 'absolute', top: '-20%', left: 0, right: 0, bottom: '-20%' }}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt={creature.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `radial-gradient(ellipse 55% 55% at 65% 35%, rgba(160,48,32,0.45) 0%, transparent 65%), linear-gradient(155deg, rgba(4,6,12,0.97) 0%, rgba(20,6,4,0.78) 50%, rgba(4,6,12,1) 100%)` }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, ${CREATURE_ACCENT} 0px, ${CREATURE_ACCENT} 1px, transparent 1px, transparent 56px)` }} />
                <div style={{ position: 'absolute', top: '50%', left: '60%', transform: 'translate(-50%, -50%)', fontSize: 'min(32rem, 58vw)', fontFamily: 'var(--font-display)', fontWeight: 700, color: CREATURE_ACCENT, opacity: 0.05, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                  {creature.name[0]}
                </div>
              </div>
            )}
          </motion.div>

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(4,6,12,0.97) 0%, rgba(4,6,12,0.4) 45%, transparent 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(4,6,12,0.52) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, pointerEvents: 'none', background: `linear-gradient(90deg, ${CREATURE_ACCENT} 0%, ${CREATURE_ACCENT}44 50%, transparent 80%)` }} />

          {/* Top bar: back + owner actions */}
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/criaturas')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(4,6,12,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: `1px solid ${CREATURE_ACCENT_DIM}`, borderRadius: 4, padding: '0.4rem 0.9rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = CREATURE_ACCENT_GLOW; b.style.borderColor = CREATURE_ACCENT }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--color-text-muted)'; b.style.borderColor = CREATURE_ACCENT_DIM }}
            >
              ← Bestiário
            </button>

            {isOwner && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/criaturas/${creature.id}/editar`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(4,6,12,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: `1px solid ${CREATURE_ACCENT_DIM}`, borderRadius: 4, padding: '0.4rem 0.9rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = CREATURE_ACCENT_GLOW; a.style.borderColor = CREATURE_ACCENT }}
                  onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = 'var(--color-text-muted)'; a.style.borderColor = CREATURE_ACCENT_DIM }}
                >
                  Editar
                </Link>

                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(4,6,12,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: `1px solid rgba(180,40,20,0.35)`, borderRadius: 4, padding: '0.4rem 0.9rem', color: 'rgba(220,80,60,0.7)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#E05040'; b.style.borderColor = '#E05040' }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'rgba(220,80,60,0.7)'; b.style.borderColor = 'rgba(180,40,20,0.35)' }}
                  >
                    Excluir
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', background: 'rgba(4,6,12,0.88)', backdropFilter: 'blur(10px)', border: `1px solid rgba(180,40,20,0.6)`, borderRadius: 4, padding: '0.4rem 0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'rgba(220,80,60,0.9)', letterSpacing: '0.08em' }}>
                      Confirmar exclusão?
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{ background: 'rgba(180,40,20,0.25)', border: `1px solid rgba(180,40,20,0.5)`, borderRadius: 3, padding: '0.18rem 0.5rem', color: '#E05040', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      {deleting ? '...' : 'Sim'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{ background: 'none', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 3, padding: '0.18rem 0.5rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hero content */}
          <motion.div
            style={{ y: heroContentY, opacity: heroOpacity, position: 'absolute', bottom: '9%', left: 0, right: 0, paddingLeft: 'max(2rem, env(safe-area-inset-left))', paddingRight: '2rem', zIndex: 10 }}
          >
            <div style={{ maxWidth: 720 }}>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: CREATURE_ACCENT, background: 'rgba(160,48,32,0.15)', border: `1px solid rgba(160,48,32,0.4)`, borderRadius: 3, padding: '0.15rem 0.5rem' }}>
                  Custom
                </span>
                {styles.map((s, i) => (
                  <span key={s} style={{ display: 'contents' }}>
                    {i > 0 && <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>}
                    <span className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)' }}>{s}</span>
                  </span>
                ))}
                <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
                <span className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                  Nível {creature.levelRange}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(3.2rem, 9vw, 7rem)', lineHeight: 0.92, color: '#F0D0C0', letterSpacing: '-0.02em', textShadow: `0 0 80px rgba(160,48,32,0.6)`, marginBottom: '1rem' }}>
                {creature.name}
              </h1>

              <div className="flex flex-wrap gap-2">
                <StatPill label="HP" value={creature.hp} />
                <StatPill label="DA" value={creature.da} />
                <StatPill label="DP" value={creature.dp} />
                <StatPill label="Dados" value={creature.diceBase} />
              </div>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            style={{ opacity: hintOpacity, position: 'absolute', bottom: 24, right: 24, zIndex: 10 }}
            className="flex flex-col items-center gap-1.5"
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>ficha</span>
            <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${CREATURE_ACCENT}55, transparent)` }} />
          </motion.div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem clamp(1.25rem, 5vw, 2rem) 7rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26 }}
            style={{ background: CREATURE_CARD_BG, border: `1px solid ${CREATURE_ACCENT_DIM}`, borderRadius: 6, padding: '2rem', boxShadow: `0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(160,48,32,0.15)` }}
          >
            <CreatureDetails creature={creature} />
          </motion.div>

          {isOwner && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Link
                to={`/criaturas/${creature.id}/editar`}
                style={{ padding: '0.55rem 1.4rem', borderRadius: 4, background: 'rgba(160,48,32,0.15)', border: `1px solid ${CREATURE_ACCENT}`, color: CREATURE_ACCENT_GLOW, fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'opacity 0.15s' }}
              >
                Editar Criatura
              </Link>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{ padding: '0.55rem 1.4rem', borderRadius: 4, background: 'rgba(180,40,20,0.1)', border: `1px solid rgba(180,40,20,0.4)`, color: 'rgba(220,80,60,0.8)', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.15s' }}
                >
                  Excluir
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.4rem 1rem', borderRadius: 4, border: `1px solid rgba(180,40,20,0.5)`, background: 'rgba(180,40,20,0.08)' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(220,80,60,0.9)' }}>Confirmar exclusão?</span>
                  <button onClick={handleDelete} disabled={deleting} style={{ padding: '0.28rem 0.7rem', borderRadius: 3, background: 'rgba(180,40,20,0.3)', border: `1px solid rgba(180,40,20,0.6)`, color: '#E05040', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                    {deleting ? '...' : 'Sim, excluir'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ padding: '0.28rem 0.7rem', borderRadius: 3, background: 'none', border: `1px solid rgba(255,255,255,0.1)`, color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <FloatingDiceButton accentColor={CREATURE_ACCENT} />
        <DiceLogSidebar />
      </div>
    </DiceLogProvider>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'rgba(4,6,12,0.65)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: `1px solid ${CREATURE_ACCENT_DIM}`, borderRadius: 4, padding: '0.32rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', color: 'var(--color-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#F0D0C0' }}>{value}</span>
    </div>
  )
}
