import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character } from '@/data/characterTypes'
import charactersData from '@characters'
import { deleteCustomCharacter, normalizeCharacter } from '@/lib/localCharacters'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import { mapApiToCharacter, isApiCharacterId } from '@/lib/apiAdapter'

const PRESET_CHARACTERS = (charactersData as Character[]).map(normalizeCharacter)

function CharacterSkeletonCard() {
  return (
    <div style={{
      borderRadius: 4,
      background: '#0D1528',
      border: '1px solid rgba(200,146,42,0.35)',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      {/* Portrait */}
      <div style={{
        height: 220,
        background: 'linear-gradient(160deg, rgba(200,146,42,0.22) 0%, rgba(200,146,42,0.08) 100%)',
        animation: 'skpulse 1.6s ease-in-out infinite',
        position: 'relative',
      }}>
        {/* Simula o gradiente de saída na base */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, #0D1528 0%, transparent 100%)',
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.25rem 1.5rem', marginTop: '-2rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {/* Race tag */}
        <div style={{ height: 16, width: 72, borderRadius: 3, background: 'rgba(200,146,42,0.25)', animation: 'skpulse 1.6s ease-in-out infinite' }} />
        {/* Name */}
        <div style={{ height: 24, width: '72%', borderRadius: 4, background: 'rgba(200,146,42,0.35)', animation: 'skpulse 1.6s ease-in-out infinite' }} />
        {/* Concept */}
        <div style={{ height: 12, width: '55%', borderRadius: 4, background: 'rgba(200,146,42,0.2)', animation: 'skpulse 1.6s ease-in-out infinite' }} />
        {/* Stats */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1, height: 38, borderRadius: 4,
              background: 'rgba(200,146,42,0.12)',
              border: '1px solid rgba(200,146,42,0.2)',
              animation: 'skpulse 1.6s ease-in-out infinite',
            }} />
          ))}
        </div>
        {/* Afinidade */}
        <div style={{ height: 10, width: '45%', borderRadius: 4, background: 'rgba(200,146,42,0.18)', animation: 'skpulse 1.6s ease-in-out infinite', marginTop: '0.1rem' }} />
      </div>
    </div>
  )
}

const ELEMENT_COLORS: Record<string, { text: string; glow: string }> = {
  'Energia':   { text: '#E8803A', glow: 'rgba(232,128,58,0.35)' },
  'Anomalia':  { text: '#6FC892', glow: 'rgba(111,200,146,0.35)' },
  'Paradoxo':  { text: '#50C8E8', glow: 'rgba(80,200,232,0.35)' },
  'Astral':    { text: '#C090F0', glow: 'rgba(192,144,240,0.35)' },
  'Cognitivo': { text: '#E8B84B', glow: 'rgba(232,184,75,0.35)' },
}
const DEFAULT_ACCENT = { text: '#80A8C8', glow: 'rgba(128,168,200,0.25)' }

function getAccent(element: string | null | undefined) {
  return element ? (ELEMENT_COLORS[element] ?? DEFAULT_ACCENT) : DEFAULT_ACCENT
}

function CharacterCard({ character, index }: { character: Character; index: number }) {
  const accent = getAccent(character.afinidade)
  const totalSkillPoints = Object.values(character.skills).reduce((s, v) => s + v, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}>
      <Link to={`/ficha/${character.id}`} className="block group">
        <div
          className="rounded-sm overflow-hidden relative transition-all duration-300"
          style={{
            background: 'rgba(4,10,20,0.95)',
            border: `1px solid rgba(255,255,255,0.07)`,
            boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.border = `1px solid ${accent.text}55`
            el.style.boxShadow = `0 8px 48px rgba(0,0,0,0.7), 0 0 32px ${accent.glow}`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.border = '1px solid rgba(255,255,255,0.07)'
            el.style.boxShadow = '0 4px 32px rgba(0,0,0,0.6)'
          }}>

          {/* Portrait area */}
          <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
            {character.image ? (
              <img
                src={character.image}
                alt={character.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                className="transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `
                  radial-gradient(ellipse 80% 80% at 50% 30%, ${accent.glow} 0%, transparent 70%),
                  linear-gradient(180deg, rgba(8,18,36,0.6) 0%, rgba(4,10,20,0.98) 100%)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  backgroundImage: `repeating-linear-gradient(0deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 40px),
                                    repeating-linear-gradient(90deg, ${accent.text} 0px, ${accent.text} 1px, transparent 1px, transparent 40px)`,
                }} />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '8rem',
                  color: accent.text,
                  opacity: 0.12,
                  userSelect: 'none',
                  lineHeight: 1,
                }}>
                  {character.name[0]}
                </span>
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
              background: 'linear-gradient(to top, rgba(4,10,20,0.98) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Info */}
          <div className="px-5 pb-5 -mt-10 relative">
            <span className="inline-block text-xs px-2 py-0.5 rounded-sm mb-2"
              style={{
                background: `${accent.text}18`,
                color: accent.text,
                border: `1px solid ${accent.text}44`,
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
              {character.race}
            </span>

            <h3 className="font-display font-bold text-2xl mb-1" style={{ color: '#EEF4FC', letterSpacing: '0.02em' }}>
              {character.name}
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
              {character.concept}
            </p>

            <div className="flex items-center gap-4 mb-4">
              {[
                { label: 'Nível', value: character.level },
                { label: 'HP', value: character.hp },
                { label: 'Perícias', value: totalSkillPoints },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="font-display font-bold text-lg" style={{ color: '#C8E0F0' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {character.afinidade && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
                  Afinidade
                </span>
                <span className="text-xs font-semibold" style={{ color: accent.text, fontFamily: 'var(--font-ui)' }}>
                  {character.afinidade}
                </span>
              </div>
            )}

            {character.campaign && (
              <div className="flex items-center gap-1.5 mt-2">
                <span style={{
                  display: 'inline-block', fontSize: '0.58rem', fontFamily: 'var(--font-ui)',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: character.campaign.role === 'npc' ? '#C090F0' : '#50C8E8',
                  background: character.campaign.role === 'npc' ? 'rgba(192,144,240,0.12)' : 'rgba(80,200,232,0.12)',
                  border: `1px solid ${character.campaign.role === 'npc' ? 'rgba(192,144,240,0.3)' : 'rgba(80,200,232,0.3)'}`,
                  borderRadius: 3, padding: '0.1rem 0.4rem',
                }}>
                  {character.campaign.role === 'npc' ? 'NPC' : 'Jogador'}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {character.campaign.title}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity group-hover:opacity-100 opacity-50"
              style={{ color: accent.text, fontFamily: 'var(--font-ui)' }}>
              Ver ficha completa
              <span>→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

type TabId = 'meus' | 'explorar' | 'arcadia'

const TABS: { id: TabId; label: string; description: string }[] = [
  { id: 'meus',    label: 'Meus Personagens', description: 'Fichas que você criou' },
  { id: 'explorar', label: 'Explorar',         description: 'Fichas públicas da comunidade' },
  { id: 'arcadia',  label: 'Arcádia',          description: 'NPCs originais do mundo' },
]

const CHARACTER_TAB_STORAGE_KEY = 'arcadia_character_list_tab'

function readStoredCharacterTab(): TabId | null {
  try {
    const stored = sessionStorage.getItem(CHARACTER_TAB_STORAGE_KEY)
    if (stored === 'meus' || stored === 'explorar' || stored === 'arcadia') return stored
  } catch {
    // sessionStorage indisponível (ex: modo privado)
  }
  return null
}

export function CharacterListPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [customChars, setCustomChars] = useState<Character[]>([])
  const [publicChars, setPublicChars] = useState<Character[]>([])
  const [loadingChars, setLoadingChars] = useState(true)
  const [loadingPublic, setLoadingPublic] = useState(true)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingDuplicateChar, setPendingDuplicateChar] = useState<Character | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const usedStoredTab = useRef(false)
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const stored = readStoredCharacterTab()
    if (stored) {
      usedStoredTab.current = true
      return stored
    }
    return user ? 'meus' : 'explorar'
  })
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const hasSettledAuthTab = useRef(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = '@keyframes skpulse{0%,100%{opacity:1}50%{opacity:0.3}}'
    document.head.appendChild(el)
    styleRef.current = el
    return () => { el.remove() }
  }, [])

  useEffect(() => {
    document.title = 'Personagens — Arcádia'
    window.scrollTo({ top: 0 })

    if (user) {
      setLoadingChars(true)
      api.characters.list()
        .then(res => {
          const chars = (res as { characters: unknown[] }).characters.map(
            c => mapApiToCharacter(c as Record<string, unknown>),
          )
          setCustomChars(chars)
        })
        .catch(() => setCustomChars([]))
        .finally(() => setLoadingChars(false))
    } else {
      setCustomChars([])
      setLoadingChars(false)
    }

    setLoadingPublic(true)
    api.characters.listPublic()
      .then(res => {
        const chars = (res as { characters: unknown[] }).characters.map(
          c => mapApiToCharacter(c as Record<string, unknown>),
        )
        setPublicChars(chars)
      })
      .catch(() => setPublicChars([]))
      .finally(() => setLoadingPublic(false))
  }, [user])

  // when user logs in, switch to their tab; when they log out, go to explorar.
  // `authLoading` is true until AuthProvider's initial getSession() resolves,
  // and the lazy useState initializer above always runs before that resolves
  // (user is still null there even for an already-logged-in session, e.g. on
  // F5). So on the first settle we don't blindly force a tab: if a tab was
  // restored from sessionStorage we only correct it if it turns out to be
  // wrong (stuck on 'meus' while actually logged out) — otherwise we trust it,
  // including 'meus' resolving true once the real user loads in. Only with no
  // stored preference do we compute the tab fresh from the resolved user.
  // Transitions observed after that first settle are real login/logout events.
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
    if (user) {
      setActiveTab('meus')
    } else {
      setActiveTab(prev => prev === 'meus' ? 'explorar' : prev)
    }
  }, [user, authLoading])

  useEffect(() => {
    try {
      sessionStorage.setItem(CHARACTER_TAB_STORAGE_KEY, activeTab)
    } catch {
      // sessionStorage indisponível (ex: modo privado)
    }
  }, [activeTab])

  async function confirmDelete() {
    if (!pendingDeleteId) return
    if (isApiCharacterId(pendingDeleteId)) {
      await api.characters.delete(pendingDeleteId)
      setCustomChars(prev => prev.filter(c => c.id !== pendingDeleteId))
    } else {
      deleteCustomCharacter(pendingDeleteId)
      setCustomChars(prev => prev.filter(c => c.id !== pendingDeleteId))
    }
    setPendingDeleteId(null)
  }

  async function handleDuplicate(character: Character) {
    if (duplicatingId) return
    setDuplicatingId(character.id)
    try {
      if (isApiCharacterId(character.id) && user) {
        const res = await api.characters.duplicate(character.id)
        const newChar = mapApiToCharacter(res.character as Record<string, unknown>)
        setCustomChars(prev => [newChar, ...prev])
      } else if (user) {
        const res = await api.characters.create({
          name: `Cópia de ${character.name}`,
          race: character.race ?? '',
          concept: character.concept ?? '',
          quote: character.quote ?? '',
          level: character.level ?? 0,
          attributes: character.attributes,
          skills: character.skills,
          talents: character.talents ?? [],
          hp: character.hp,
          sanidade: character.sanidade,
          afinidade: character.afinidade ?? '',
          antitese: character.antitese ?? '',
          entropia: character.entropia ?? 0,
          modificadores: character.modificadores ?? { potencia: 0, complexidade: 0, forma: 0, controle: 0 },
          marcas: character.marcas ?? [],
          traumas: character.traumas ?? [],
          antecedentes: character.antecedentes ?? [],
          is_public: false,
        })
        let newChar = mapApiToCharacter(res.character as Record<string, unknown>)
        if (character.image) {
          try {
            const imgRes = await fetch(character.image)
            const blob = await imgRes.blob()
            const ext = character.image.split('.').pop()?.split('?')[0] ?? 'jpg'
            const file = new File([blob], `cover.${ext}`, { type: blob.type || 'image/jpeg' })
            const { url } = await api.upload.characterImage(newChar.id, file)
            const updated = await api.characters.update(newChar.id, { image_url: url })
            newChar = mapApiToCharacter(updated.character as Record<string, unknown>)
          } catch {
            // image upload failed, character still created without image
          }
        }
        setCustomChars(prev => [newChar, ...prev])
      }
      setActiveTab('meus')
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setDuplicatingId(null)
    }
  }

  const pendingChar = customChars.find(c => c.id === pendingDeleteId)

  const visibleTabs = user ? TABS : TABS.filter(t => t.id !== 'meus')

  const counts: Record<TabId, number | null> = {
    meus: loadingChars ? null : customChars.length,
    explorar: loadingPublic ? null : publicChars.length,
    arcadia: PRESET_CHARACTERS.length,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: 'var(--color-abyss)' }}>

      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(8,18,36,0.9) 0%, var(--color-abyss) 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '4rem 2rem 0',
        }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: `repeating-linear-gradient(0deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(90deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px)`,
          pointerEvents: 'none',
        }} />

        <div className="relative max-w-4xl mx-auto">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 mb-4 transition-opacity duration-200 hover:opacity-80"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}
              >
                ← Início
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
                style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-ui)' }}>
                Fichas de Personagem
              </p>
              <h1 className="font-display font-bold text-4xl mb-3" style={{ color: '#EEF4FC', letterSpacing: '-0.01em' }}>
                Personagens
              </h1>
              <p className="font-body text-base" style={{ color: 'var(--color-text-secondary)', maxWidth: 520 }}>
                Aventureiros prontos para o Mar de Nuvens — ou crie o seu próprio.
              </p>
            </div>

            {activeTab === 'meus' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(user ? '/criar-ficha' : '/login')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.1rem', borderRadius: 4,
                  background: 'var(--color-arcano)', border: 'none',
                  color: '#0A0A0A', fontFamily: 'var(--font-ui)',
                  fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                + Criar Personagem
              </motion.button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {visibleTabs.map(tab => {
              const isActive = activeTab === tab.id
              const count = counts[tab.id]
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: 'relative',
                    padding: '0.75rem 1.25rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: '0.06em',
                    color: isActive ? 'var(--color-arcano)' : 'var(--color-text-muted)',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.35rem',
                      borderRadius: 10,
                      background: isActive ? 'rgba(200,146,42,0.18)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? 'var(--color-arcano)' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.2s',
                    }}>
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'var(--color-arcano)',
                        borderRadius: '2px 2px 0 0',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'meus' && (
            <motion.div
              key="meus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}>
              {loadingChars ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => <CharacterSkeletonCard key={i} />)}
                </div>
              ) : customChars.length === 0 ? (
                <div style={{
                  padding: '4rem 2rem', textAlign: 'center',
                  border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4,
                }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#EEF4FC', marginBottom: '0.5rem' }}>
                    Nenhum personagem ainda
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                    Crie seu primeiro aventureiro e embarque no Mar de Nuvens.
                  </p>
                  <button
                    onClick={() => navigate('/criar-ficha')}
                    style={{
                      padding: '0.55rem 1.1rem', borderRadius: 4,
                      background: 'var(--color-arcano)', border: 'none',
                      color: '#0A0A0A', fontFamily: 'var(--font-ui)',
                      fontSize: '0.75rem', fontWeight: 700,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    + Criar Personagem
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {customChars.map((character, i) => (
                    <div key={character.id} style={{ position: 'relative' }}>
                      <CharacterCard character={character} index={i} />
                      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: '0.3rem' }}>
                        <button
                          onClick={() => setPendingDuplicateChar(character)}
                          disabled={duplicatingId === character.id}
                          title="Duplicar personagem"
                          style={{
                            background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 4, padding: '0.2rem 0.45rem', cursor: duplicatingId === character.id ? 'not-allowed' : 'pointer',
                            color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
                            backdropFilter: 'blur(4px)',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
                        >
                          {duplicatingId === character.id ? '…' : '⎘'}
                        </button>
                        <button
                          onClick={() => setPendingDeleteId(character.id)}
                          title="Excluir personagem"
                          style={{
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
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'explorar' && (
            <motion.div
              key="explorar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}>
              {loadingPublic ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <CharacterSkeletonCard key={i} />)}
                </div>
              ) : publicChars.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem' }}>
                    Nenhuma ficha pública disponível ainda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {publicChars.map((character, i) => (
                    <div key={character.id} style={{ position: 'relative' }}>
                      <CharacterCard character={character} index={i} />
                      {user && (
                        <button
                          onClick={() => setPendingDuplicateChar(character)}
                          disabled={duplicatingId === character.id}
                          title="Duplicar personagem"
                          style={{
                            position: 'absolute', top: 8, right: 8, zIndex: 10,
                            background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 4, padding: '0.2rem 0.45rem', cursor: duplicatingId === character.id ? 'not-allowed' : 'pointer',
                            color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
                            backdropFilter: 'blur(4px)',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
                        >
                          {duplicatingId === character.id ? '…' : '⎘'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'arcadia' && (
            <motion.div
              key="arcadia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRESET_CHARACTERS.map((character, i) => (
                  <div key={character.id} style={{ position: 'relative' }}>
                    <CharacterCard character={character} index={i} />
                    {user && (
                      <button
                        onClick={() => setPendingDuplicateChar(character)}
                        disabled={duplicatingId === character.id}
                        title="Duplicar personagem"
                        style={{
                          position: 'absolute', top: 8, right: 8, zIndex: 10,
                          background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 4, padding: '0.2rem 0.45rem', cursor: duplicatingId === character.id ? 'not-allowed' : 'pointer',
                          color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
                          backdropFilter: 'blur(4px)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-arcano)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
                      >
                        {duplicatingId === character.id ? '…' : '⎘'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {pendingDeleteId && pendingChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setPendingDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{
                background: '#0A0F1E',
                border: '1px solid rgba(200,60,60,0.35)',
                borderRadius: 8,
                padding: '1.75rem',
                width: 360,
                maxWidth: 'calc(100vw - 2rem)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#EEF4FC',
                marginBottom: '0.5rem',
              }}>
                Excluir personagem?
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}>
                <span style={{ color: '#EEF4FC', fontWeight: 600 }}>{pendingChar.name}</span>
                {' '}será removido permanentemente. Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setPendingDeleteId(null)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4,
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    padding: '0.45rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    background: 'rgba(200,60,60,0.2)',
                    border: '1px solid rgba(200,60,60,0.55)',
                    borderRadius: 4,
                    color: '#E07070',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '0.45rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate confirmation modal */}
      <AnimatePresence>
        {pendingDuplicateChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setPendingDuplicateChar(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{
                background: '#0A0F1E',
                border: '1px solid rgba(200,146,42,0.3)',
                borderRadius: 8,
                padding: '1.75rem',
                width: 360,
                maxWidth: 'calc(100vw - 2rem)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#EEF4FC',
                marginBottom: '0.5rem',
              }}>
                Duplicar personagem?
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}>
                Uma cópia de <span style={{ color: '#EEF4FC', fontWeight: 600 }}>{pendingDuplicateChar.name}</span> será criada nas suas fichas.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setPendingDuplicateChar(null)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4,
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    padding: '0.45rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { const c = pendingDuplicateChar; setPendingDuplicateChar(null); handleDuplicate(c) }}
                  style={{
                    background: 'rgba(200,146,42,0.15)',
                    border: '1px solid rgba(200,146,42,0.45)',
                    borderRadius: 4,
                    color: 'var(--color-arcano)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '0.45rem 1rem',
                    cursor: 'pointer',
                  }}
                >
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
