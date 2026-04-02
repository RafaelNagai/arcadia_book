import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { slugifyHeading } from '@/data/slugify'

interface TocEntry {
  level: 2 | 3
  text: string
  id: string
}

function parseToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  for (const line of markdown.split('\n')) {
    const h2 = line.match(/^## (.+)/)
    const h3 = line.match(/^### (.+)/)
    if (h2) {
      const text = h2[1].trim()
      entries.push({ level: 2, text, id: slugifyHeading(text) })
    } else if (h3) {
      const text = h3[1].trim()
      entries.push({ level: 3, text, id: slugifyHeading(text) })
    }
  }
  return entries
}

function useActiveHeading(ids: string[]): string {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (ids.length === 0) return

    // Track which headings are above the fold — the last one wins
    const handleScroll = () => {
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 120) current = id
      }
      setActive(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ids])

  return active
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const entries = parseToc(content)
  const ids = entries.map(e => e.id)
  const active = useActiveHeading(ids)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (entries.length < 2) return null

  const activeEntry = entries.find(e => e.id === active)

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Expandable panel */}
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Índice do capítulo"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="origin-bottom-right rounded-sm overflow-hidden"
            style={{
              background: 'var(--color-deep)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              width: 220,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            <div className="p-4">
              <p
                className="text-xs uppercase tracking-[0.2em] mb-3 font-semibold"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                Neste capítulo
              </p>
              <ul className="space-y-0.5">
                {entries.map(entry => {
                  const isActive = active === entry.id
                  return (
                    <li key={entry.id} style={{ paddingLeft: entry.level === 3 ? '0.75rem' : '0' }}>
                      <a
                        href={`#${entry.id}`}
                        onClick={e => {
                          e.preventDefault()
                          setOpen(false)
                          document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className="block py-1 text-xs leading-snug transition-all duration-150"
                        style={{
                          color: isActive ? 'var(--color-arcano-glow)' : 'var(--color-text-muted)',
                          fontFamily: 'var(--font-ui)',
                          borderLeft: isActive ? '2px solid var(--color-arcano)' : '2px solid transparent',
                          paddingLeft: '0.5rem',
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {entry.text}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Fechar índice' : 'Abrir índice'}
        className="flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-150"
        style={{
          background: open ? 'var(--color-arcano)' : 'var(--color-deep)',
          border: '1px solid',
          borderColor: open ? 'var(--color-arcano)' : 'var(--color-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: open ? '#04060C' : 'var(--color-text-muted)',
        }}
      >
        {/* List icon */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="4" y1="4" x2="14" y2="4" />
          <line x1="4" y1="8" x2="14" y2="8" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <circle cx="1.5" cy="4" r="1" fill="currentColor" stroke="none" />
          <circle cx="1.5" cy="8" r="1" fill="currentColor" stroke="none" />
          <circle cx="1.5" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>

        {/* Active section label — hidden when open */}
        {!open && activeEntry && (
          <span
            className="text-xs max-w-[120px] truncate"
            style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-arcano-glow)' }}
          >
            {activeEntry.text}
          </span>
        )}

        {!open && !activeEntry && (
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            Índice
          </span>
        )}
      </button>
    </div>
  )
}
