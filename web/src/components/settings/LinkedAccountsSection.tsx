import { useEffect, useState } from 'react'
import type { UserIdentity } from '@supabase/supabase-js'
import { useAuth } from '@/lib/authContext'

export function LinkedAccountsSection() {
  const { getIdentities, linkDiscordIdentity, unlinkDiscordIdentity } = useAuth()

  const [discordIdentity, setDiscordIdentity] = useState<UserIdentity | null>(null)
  const [checking, setChecking] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadIdentities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadIdentities() {
    setChecking(true)
    try {
      const identities = await getIdentities()
      setDiscordIdentity(identities.find(i => i.provider === 'discord') ?? null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setChecking(false)
    }
  }

  async function handleLink() {
    setError(null)
    setSuccess(null)
    setActionLoading(true)
    try {
      await linkDiscordIdentity()
    } catch (err) {
      setError((err as Error).message)
      setActionLoading(false)
    }
  }

  async function handleUnlink() {
    if (!discordIdentity) return
    setError(null)
    setSuccess(null)
    setActionLoading(true)
    try {
      await unlinkDiscordIdentity(discordIdentity)
      setSuccess('Conta Discord desvinculada com sucesso')
      setDiscordIdentity(null)
    } catch (err) {
      const message = (err as Error).message
      const translations: Record<string, string> = {
        'User must have at least 1 identity after unlinking':
          'Não é possível desvincular: esta é sua única forma de login. Adicione outra forma de acesso antes de desvincular o Discord.',
      }
      setError(translations[message] ?? message)
    } finally {
      setActionLoading(false)
    }
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

  const discordLabel = discordIdentity
    ? (discordIdentity.identity_data?.full_name as string | undefined)
      ?? (discordIdentity.identity_data?.username as string | undefined)
      ?? (discordIdentity.identity_data?.email as string | undefined)
      ?? 'Conta vinculada'
    : null

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
        Contas Vinculadas
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Discord</label>

          {checking ? (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}>
              Verificando...
            </p>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 0.85rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 4,
            }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.85rem',
                  color: discordIdentity ? '#6FC892' : 'var(--color-text-primary)',
                  fontWeight: 600,
                }}>
                  {discordIdentity ? 'Vinculado' : 'Não vinculado'}
                </p>
                {discordLabel && (
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.2rem',
                  }}>
                    {discordLabel}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={discordIdentity ? handleUnlink : handleLink}
                disabled={actionLoading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 4,
                  border: discordIdentity ? '1px solid rgba(200,60,60,0.35)' : 'none',
                  background: actionLoading
                    ? 'rgba(255,255,255,0.05)'
                    : discordIdentity ? 'transparent' : 'var(--color-arcano)',
                  color: actionLoading
                    ? 'rgba(255,255,255,0.2)'
                    : discordIdentity ? '#E07070' : '#0A0A0A',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {actionLoading ? 'Aguarde...' : discordIdentity ? 'Desvincular' : 'Vincular Discord'}
              </button>
            </div>
          )}
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
      </div>
    </div>
  )
}
