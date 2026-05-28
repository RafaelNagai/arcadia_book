import { useState } from 'react'
import { useAuth } from '@/lib/authContext'

export function ChangePasswordSection() {
  const { updatePassword } = useAuth()

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      await updatePassword(newPassword)
      setSuccess(true)
      setNewPassword('')
      setConfirm('')
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
    <div style={{
      background: 'rgba(10,15,30,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      padding: '1.5rem',
    }}>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-arcano)',
        marginBottom: '1.25rem',
      }}>
        Alterar Senha
      </p>

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
            Senha alterada com sucesso
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.65rem',
            borderRadius: 4,
            border: 'none',
            background: loading ? 'rgba(255,255,255,0.05)' : 'var(--color-arcano)',
            color: loading ? 'rgba(255,255,255,0.2)' : '#0A0A0A',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Aguarde...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
