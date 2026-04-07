import { NavLink } from 'react-router-dom'
import { PARTS, getChaptersByPart } from '@/data/chapterManifest'
import type { Part } from '@/data/chapterManifest'
import versionData from '@version'

const PART_NUMBERS: Record<Part, string> = {
  'Fundamentos':             'I',
  'O Arcano':                'II',
  'O Navio e a Tripulação':  'III',
  'O Mundo':                 'IV',
  'One-Shots':               'V',
}

function SearchIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

interface SidebarProps {
  onClose?: () => void
  onSearchOpen: () => void
}

export function Sidebar({ onClose, onSearchOpen }: SidebarProps) {
  return (
    <nav className="flex flex-col h-full overflow-y-auto py-6 px-4">
      {/* Logo */}
      <NavLink to="/" onClick={onClose} className="mb-8 block text-center px-2">
        <img
          src="/assets/images/logo.png"
          alt="Arcádia"
          className="w-full mx-auto"
          style={{
            maxWidth: 160,
            filter: 'drop-shadow(0 0 12px rgba(100,220,200,0.3))',
          }}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}>
          Livro (v{versionData.version})
        </p>
      </NavLink>

      {/* Search button */}
      <button
        onClick={onSearchOpen}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-6 transition-colors duration-150 hover:border-opacity-60"
        style={{
          color: 'var(--color-text-muted)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <SearchIcon />
        <span className="flex-1 text-left text-xs">Buscar…</span>
        <kbd
          style={{
            fontSize: '0.6rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-ui)',
            opacity: 0.7,
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Chapter groups */}
      {PARTS.map(part => {
        const chapters = getChaptersByPart(part)
        return (
          <div key={part} className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 px-2"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
            >
              Parte {PART_NUMBERS[part]} — {part}
            </p>
            <ul className="space-y-0.5">
              {chapters.map(chapter => (
                <li key={chapter.id}>
                  <NavLink
                    to={`/capitulo/${chapter.slug}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150',
                        isActive
                          ? 'border-l-2 bg-opacity-20 font-medium'
                          : 'border-l-2 border-transparent hover:bg-opacity-10',
                      ].join(' ')
                    }
                    style={({ isActive }) => ({
                      borderLeftColor: isActive ? 'var(--color-arcano)' : 'transparent',
                      backgroundColor: isActive ? 'rgba(200,146,42,0.1)' : undefined,
                      color: isActive ? 'var(--color-arcano-glow)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-ui)',
                    })}
                  >
                    <span
                      className="text-xs w-5 shrink-0 text-center"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {String(chapter.order).padStart(2, '0')}
                    </span>
                    <span>{chapter.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {/* Footer */}
      <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <NavLink
          to="/"
          onClick={onClose}
          className="text-xs px-2 transition-colors"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
        >
          ← Página inicial
        </NavLink>
      </div>
    </nav>
  )
}
