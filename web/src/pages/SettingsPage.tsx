import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { ChangePasswordSection } from '@/components/settings/ChangePasswordSection'
import { Navbar } from '@/components/layout/Navbar'

type SettingsSection = 'seguranca'

const MENU_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'seguranca', label: 'Segurança' },
]

export function SettingsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState<SettingsSection>('seguranca')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  if (loading || !user) return null

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen"
        style={{ background: 'var(--color-abyss)', paddingTop: '4rem' }}
      >
        <div style={{
          position: 'fixed', inset: 0, opacity: 0.02, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px),
                            repeating-linear-gradient(90deg, var(--color-arcano) 0px, var(--color-arcano) 1px, transparent 1px, transparent 60px)`,
        }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            maxWidth: 780,
            margin: '2rem auto',
            padding: '0 1rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Sidebar */}
          <aside style={{
            width: 200,
            flexShrink: 0,
            background: 'rgba(10,15,30,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '0.5rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              padding: '0.5rem 0.75rem 0.75rem',
            }}>
              Configurações
            </p>
            {MENU_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 4,
                  border: 'none',
                  background: active === item.id ? 'rgba(200,146,42,0.12)' : 'transparent',
                  color: active === item.id ? 'var(--color-arcano)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8rem',
                  fontWeight: active === item.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  borderLeft: active === item.id ? '2px solid var(--color-arcano)' : '2px solid transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {active === 'seguranca' && <ChangePasswordSection />}
          </div>
        </motion.div>
      </div>
    </>
  )
}
