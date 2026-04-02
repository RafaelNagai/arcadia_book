import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { SearchModal } from '@/components/search/SearchModal'

const SIDEBAR_WIDTH = 272

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false)
  }, [location.pathname])

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-abyss)' }}>
      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full border-r z-40"
        style={{
          width: SIDEBAR_WIDTH,
          background: 'var(--color-deep)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Sidebar onSearchOpen={() => setSearchOpen(true)} />
      </aside>

      {/* Mobile: top bar + drawer */}
      <TopBar
        onMenuToggle={() => setSidebarOpen(v => !v)}
        isSidebarOpen={sidebarOpen}
        onSearchOpen={() => setSearchOpen(true)}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(4,6,12,0.75)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 h-full z-50 border-r lg:hidden"
              style={{
                width: SIDEBAR_WIDTH,
                background: 'var(--color-deep)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} onSearchOpen={() => setSearchOpen(true)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global search modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main content */}
      <main
        className="flex-1 min-h-screen pt-14 lg:pt-0"
        style={{ marginLeft: 0 }}
      >
        <div className="lg:ml-[272px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
