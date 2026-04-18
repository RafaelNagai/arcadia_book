import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/authContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/personagens')
      } else {
        await signUp(email, password)
        setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
        setPassword('')
      }
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

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-abyss)' }}
    >
      {/* Subtle grid */}
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
        {/* Logo */}
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
            Sistema de Fichas
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null) }}
              style={{
                flex: 1,
                padding: '0.55rem',
                border: 'none',
                borderRadius: 0,
                background: mode === m ? 'rgba(200,146,42,0.15)' : 'transparent',
                color: mode === m ? 'var(--color-arcano)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,146,42,0.5)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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

          {success && (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: '#6FC892',
              background: 'rgba(42,155,111,0.1)',
              border: '1px solid rgba(42,155,111,0.25)',
              borderRadius: 4,
              padding: '0.5rem 0.75rem',
            }}>
              {success}
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
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{
            marginTop: '1rem',
            textAlign: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
          }}>
            <Link
              to="/esqueci-senha"
              style={{ color: 'var(--color-arcano)', textDecoration: 'none', opacity: 0.7 }}
            >
              Esqueci minha senha
            </Link>
          </p>
        )}

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <Link
            to="/personagens"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            ← Continuar sem conta
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
