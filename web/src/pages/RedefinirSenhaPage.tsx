import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/apiClient'
import { useAuth } from '@/lib/authContext'

type PageState = 'waiting' | 'ready' | 'invalid' | 'success'

export function RedefinirSenhaPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [pageState, setPageState] = useState<PageState>('waiting')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      }
    })

    const hash = window.location.hash
    if (!hash.includes('type=recovery') && !hash.includes('access_token')) {
      setPageState('invalid')
    }

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await updatePassword(newPassword)
      setPageState('success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    marginBottom: '0.4rem',
  }

  function renderContent() {
    if (pageState === 'invalid') {
      return (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          color: '#E07070',
          background: 'rgba(200,60,60,0.1)',
          border: '1px solid rgba(200,60,60,0.25)',
          borderRadius: 4,
          padding: '0.75rem',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Link inválido ou expirado. Solicite um novo link de redefinição de senha.
        </p>
      )
    }

    if (pageState === 'success') {
      return (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          color: '#6FC892',
          background: 'rgba(42,155,111,0.1)',
          border: '1px solid rgba(42,155,111,0.25)',
          borderRadius: 4,
          padding: '0.75rem',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Senha alterada com sucesso! Redirecionando...
        </p>
      )
    }

    if (pageState === 'waiting') {
      return (
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}>
          Verificando link...
        </p>
      )
    }

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Confirmar senha</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          />
        </div>

        {error && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: '#E07070',
            background: 'rgba(200,60,60,0.1)',
            border: '1px solid rgba(200,60,60,0.25)',
            borderRadius: 4,
            padding: '0.5rem 0.75rem',
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            borderRadius: 4,
            border: 'none',
            background: loading ? 'rgba(255,255,255,0.05)' : 'var(--color-arcano)',
            color: loading ? 'rgba(255,255,255,0.2)' : '#0A0A0A',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Aguarde...' : 'Redefinir senha'}
        </button>
      </form>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-abyss)' }}
    >
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.02, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(0deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px),
                          repeating-linear-gradient(90deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px)`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 1rem',
          background: 'rgba(10,15,30,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        <div className="text-center mb-8">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-arcano)',
              letterSpacing: '0.1em',
            }}>
              ARCÁDIA
            </p>
          </Link>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            marginTop: '0.25rem',
            letterSpacing: '0.08em',
          }}>
            Redefinir senha
          </p>
        </div>

        {renderContent()}

        {(pageState === 'invalid' || pageState === 'ready') && (
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <Link
              to="/login"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
              }}
            >
              ← Voltar ao login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
