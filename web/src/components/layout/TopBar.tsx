import { NavLink } from 'react-router-dom'

interface TopBarProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export function TopBar({ onMenuToggle, isSidebarOpen }: TopBarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b lg:hidden"
      style={{
        background: 'rgba(10, 15, 30, 0.95)',
        backdropFilter: 'blur(8px)',
        borderColor: 'var(--color-border)',
      }}
    >
      <NavLink to="/" className="flex items-center">
        <img
          src="/assets/images/logo.png"
          alt="Arcádia"
          className="h-8 w-auto"
          style={{ filter: 'drop-shadow(0 0 8px rgba(100,220,200,0.35))' }}
        />
      </NavLink>

      <button
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        className="flex flex-col gap-1.5 p-2"
      >
        <span
          className={`block w-6 h-0.5 transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`}
          style={{ background: 'var(--color-arcano)' }}
        />
        <span
          className={`block w-6 h-0.5 transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}
          style={{ background: 'var(--color-arcano)' }}
        />
        <span
          className={`block w-6 h-0.5 transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}
          style={{ background: 'var(--color-arcano)' }}
        />
      </button>
    </header>
  )
}
