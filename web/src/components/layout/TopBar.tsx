import { NavLink } from 'react-router-dom'

function SearchIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

interface TopBarProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
  onSearchOpen: () => void
}

export function TopBar({ onMenuToggle, isSidebarOpen, onSearchOpen }: TopBarProps) {
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

      <div className="flex items-center gap-1">
        {/* Search icon */}
        <button
          onClick={onSearchOpen}
          aria-label="Buscar"
          className="p-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-arcano)' }}
        >
          <SearchIcon />
        </button>

        {/* Hamburger */}
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
      </div>
    </header>
  )
}
