import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { api } from '@/lib/apiClient'
import { CustomCreatureForm } from '@/components/creature/CustomCreatureForm'
import type { CustomCreatureFormData } from '@/components/creature/CustomCreatureForm'
import type { CustomCreature } from '@/data/creatureTypes'
import { CREATURE_ACCENT, CREATURE_ACCENT_DIM } from '@/components/creature/constants'

export function CustomCreatureFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [existing, setExisting] = useState<CustomCreature | null>(null)
  const [loadingCreature, setLoadingCreature] = useState(!!id)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!id

  useEffect(() => {
    document.title = isEdit ? 'Editar Criatura — Arcádia' : 'Nova Criatura — Arcádia'
    window.scrollTo({ top: 0 })
  }, [isEdit])

  useEffect(() => {
    if (!id) return
    setLoadingCreature(true)
    api.customCreatures.get(id)
      .then(res => setExisting(res.creature))
      .catch(err => setError((err as Error).message))
      .finally(() => setLoadingCreature(false))
  }, [id])

  async function handleSubmit(data: CustomCreatureFormData) {
    setError(null)
    setSubmitting(true)
    try {
      let imageUrl = data.imageUrl

      if (isEdit && existing) {
        const payload = {
          name: data.name,
          levelRange: data.levelRange,
          style: data.style,
          lore: data.lore,
          diceBase: data.diceBase,
          hp: data.hp,
          da: data.da,
          dp: data.dp,
          attributes: data.attributes,
          immune: data.immune,
          vulnerable: data.vulnerable,
          interactions: data.interactions,
          actions: data.actions,
          reactions: data.reactions,
          variants: data.variants,
          isPublic: data.isPublic,
          imageUrl,
        }
        const res = await api.customCreatures.update(existing.id, payload)

        if (data.imageFile) {
          const uploaded = await api.customCreatures.uploadImage(res.creature.id, data.imageFile)
          await api.customCreatures.update(res.creature.id, { imageUrl: uploaded.url })
        }

        navigate('/criaturas')
      } else {
        const payload = {
          name: data.name,
          levelRange: data.levelRange,
          style: data.style,
          lore: data.lore,
          diceBase: data.diceBase,
          hp: data.hp,
          da: data.da,
          dp: data.dp,
          attributes: data.attributes,
          immune: data.immune,
          vulnerable: data.vulnerable,
          interactions: data.interactions,
          actions: data.actions,
          reactions: data.reactions,
          variants: data.variants,
          isPublic: data.isPublic,
          imageUrl,
        }
        const res = await api.customCreatures.create(payload)

        if (data.imageFile) {
          const uploaded = await api.customCreatures.uploadImage(res.creature.id, data.imageFile)
          await api.customCreatures.update(res.creature.id, { imageUrl: uploaded.url })
        }

        navigate('/criaturas')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-abyss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-abyss)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Você precisa estar autenticado para criar criaturas.
        </p>
        <Link to="/login" style={{ color: CREATURE_ACCENT_DIM, fontFamily: 'var(--font-ui)', fontSize: '0.82rem' }}>
          Fazer login →
        </Link>
      </div>
    )
  }

  if (loadingCreature) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-abyss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Carregando criatura...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: 'var(--color-abyss)' }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(40,10,6,0.9) 0%, var(--color-abyss) 100%)',
          borderBottom: `1px solid rgba(160,48,32,0.18)`,
          padding: '3.5rem 2rem 2.5rem',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <Link
            to="/criaturas"
            style={{
              color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
              letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              marginBottom: '1rem', transition: 'opacity 0.15s',
            }}
          >
            ← Bestiário
          </Link>
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-2"
            style={{ color: 'rgba(160,48,32,0.65)', fontFamily: 'var(--font-ui)' }}
          >
            {isEdit ? 'Editar criatura' : 'Nova criatura'}
          </p>
          <h1
            className="font-display font-bold text-3xl"
            style={{ color: '#F0D0C0', letterSpacing: '-0.01em' }}
          >
            {isEdit ? (existing?.name ?? 'Editar') : 'Criar Criatura'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div
          style={{
            background: 'rgba(10,6,4,0.95)',
            border: `1px solid ${CREATURE_ACCENT_DIM}`,
            borderRadius: 8,
            padding: '2rem',
          }}
        >
          <CustomCreatureForm
            initial={existing ?? undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        </div>
      </div>
    </motion.div>
  )
}
