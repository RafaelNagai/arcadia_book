import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const SIDEBAR_WIDTH = 272

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

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
        <Sidebar />
      </aside>

      {/* Mobile: top bar + drawer */}
      <TopBar onMenuToggle={() => setSidebarOpen(v => !v)} isSidebarOpen={sidebarOpen} />

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
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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
