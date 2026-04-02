import { NavLink } from 'react-router-dom'
import { PARTS, getChaptersByPart } from '@/data/chapterManifest'
import type { Part } from '@/data/chapterManifest'

const PART_NUMBERS: Record<Part, string> = {
  'Fundamentos':             'I',
  'O Arcano':                'II',
  'O Navio e a Tripulação':  'III',
  'O Mundo':                 'IV',
}

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
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
          Livro do Sistema
        </p>
      </NavLink>

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
