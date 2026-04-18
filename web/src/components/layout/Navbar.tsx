import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/authContext'

const NAV_LINKS = [
  { to: '/personagens', label: 'Personagens' },
  { to: '/campanhas', label: 'Campanhas' },
]

export function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(to: string) {
    return location.pathname.startsWith(to)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/personagens')
    setMenuOpen(false)
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 52,
        background: 'rgba(4,6,12,0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center',
        padding: '0 1.25rem',
        gap: '1.5rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <img
            src="/assets/images/logo.png"
            alt="Arcádia"
            style={{ height: 32, width: 'auto', display: 'block' }}
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex" style={{ gap: '0.25rem', flex: 1 }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 4,
                color: isActive(link.to) ? 'var(--color-arcano)' : 'var(--color-text-muted)',
                background: isActive(link.to) ? 'rgba(200,146,42,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden sm:flex" style={{ marginLeft: 'auto', gap: '0.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 4,
                background: 'rgba(200,146,42,0.12)',
                border: '1px solid rgba(200,146,42,0.3)',
                color: 'var(--color-arcano)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col sm:hidden"
          onClick={() => setMenuOpen(v => !v)}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: '0.25rem',
            gap: 5,
          }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block',
              width: 22,
              height: 2,
              background: 'currentColor',
              borderRadius: 2,
              transition: 'transform 0.2s, opacity 0.2s',
              transform: menuOpen
                ? i === 0 ? 'translateY(7px) rotate(45deg)'
                : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                : 'scaleX(0)'
                : 'none',
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 98,
                background: 'rgba(0,0,0,0.5)',
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 240, zIndex: 99,
                background: 'var(--color-deep)',
                borderLeft: '1px solid var(--color-border)',
                padding: '5rem 1.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 4,
                    color: isActive(link.to) ? 'var(--color-arcano)' : 'var(--color-text-secondary)',
                    background: isActive(link.to) ? 'rgba(200,146,42,0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                {user ? (
                  <>
                    <p style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.email}
                    </p>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.55rem',
                      borderRadius: 4,
                      background: 'rgba(200,146,42,0.12)',
                      border: '1px solid rgba(200,146,42,0.3)',
                      color: 'var(--color-arcano)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content doesn't go under the fixed navbar */}
      <div style={{ height: 52 }} />
    </>
  )
}
