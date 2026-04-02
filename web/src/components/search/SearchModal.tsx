import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { searchEntries } from '@/data/searchIndex'
import type { SearchEntry } from '@/data/searchIndex'

/* ─── Helpers ────────────────────────────────────────────────────── */

function buildHref(entry: SearchEntry): string {
  const base = `/capitulo/${entry.chapterSlug}`
  return entry.anchorId ? `${base}#${entry.anchorId}` : base
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/** Highlight occurrences of `query` in `text` with a <mark>. */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const nq = normalize(query.trim())
  const nt = normalize(text)
  const idx = nt.indexOf(nq)

  if (idx === -1) return <>{text}</>

  const before = text.slice(0, idx)
  const match  = text.slice(idx, idx + query.trim().length)
  const after  = text.slice(idx + query.trim().length)

  return (
    <>
      {before}
      <mark
        style={{
          background: 'rgba(200,146,42,0.18)',
          color: 'var(--color-arcano-glow)',
          borderRadius: 2,
          padding: '0 1px',
        }}
      >
        {match}
      </mark>
      {after}
    </>
  )
}

/* ─── Result item ────────────────────────────────────────────────── */

interface ResultItemProps {
  entry: SearchEntry
  query: string
  isActive: boolean
  onClick: () => void
  onMouseEnter: () => void
}

function ResultItem({ entry, query, isActive, onClick, onMouseEnter }: ResultItemProps) {
  const levelIcon = entry.headingLevel === 1 ? '◈' : entry.headingLevel === 2 ? '›' : '·'

  return (
    <li>
      <button
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors duration-75"
        style={{
          background: isActive ? 'rgba(200,146,42,0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--color-arcano)' : '2px solid transparent',
        }}
      >
        {/* Level icon */}
        <span
          className="mt-0.5 text-xs shrink-0 w-4 text-center"
          style={{ color: 'var(--color-arcano-dim)', fontFamily: 'var(--font-display)' }}
        >
          {levelIcon}
        </span>

        <div className="flex-1 min-w-0">
          {/* Chapter + part breadcrumb */}
          <p
            className="text-xs mb-0.5 truncate"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
          >
            {entry.part} · {entry.chapterTitle}
          </p>

          {/* Heading */}
          <p
            className="text-sm font-medium truncate"
            style={{ color: isActive ? 'var(--color-arcano-glow)' : 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            <Highlighted text={entry.headingText} query={query} />
          </p>

          {/* Preview */}
          {entry.preview && (
            <p
              className="text-xs mt-0.5 line-clamp-1"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              <Highlighted text={entry.preview} query={query} />
            </p>
          )}
        </div>
      </button>
    </li>
  )
}

/* ─── Search icon SVG ────────────────────────────────────────────── */

function SearchIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={style}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

/* ─── Main component ─────────────────────────────────────────────── */

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery]       = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLUListElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => searchEntries(query), [query])

  // Reset active index when results change
  useEffect(() => { setActiveIndex(0) }, [query])

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const goToResult = useCallback((entry: SearchEntry) => {
    navigate(buildHref(entry))
    onClose()
  }, [navigate, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const active = results[activeIndex]
      if (active) goToResult(active.entry)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center px-4"
          style={{ background: 'rgba(4,6,12,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            key="search-card"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="w-full rounded-xl border overflow-hidden"
            style={{
              marginTop: '10vh',
              maxWidth: 640,
              background: 'var(--color-deep)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Input row */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <SearchIcon style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Pesquisar nos capítulos…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-ui)',
                  caretColor: 'var(--color-arcano)',
                }}
              />
              <kbd
                className="text-xs px-1.5 py-0.5 rounded border hidden sm:block"
                style={{
                  color: 'var(--color-text-muted)',
                  borderColor: 'var(--color-border)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.65rem',
                }}
              >
                Esc
              </kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul
                ref={listRef}
                className="overflow-y-auto divide-y"
                style={{ maxHeight: '60vh', borderColor: 'var(--color-border)' }}
              >
                {results.map((result, i) => (
                  <ResultItem
                    key={`${result.entry.chapterId}-${result.entry.anchorId || 'top'}-${i}`}
                    entry={result.entry}
                    query={query}
                    isActive={i === activeIndex}
                    onClick={() => goToResult(result.entry)}
                    onMouseEnter={() => setActiveIndex(i)}
                  />
                ))}
              </ul>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <div
                className="px-4 py-10 text-center text-sm"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                Nenhum resultado para &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Empty state */}
            {!query.trim() && (
              <div
                className="px-4 py-8 text-center text-sm"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                Digite para pesquisar nos capítulos…
              </div>
            )}

            {/* Footer hint */}
            {results.length > 0 && (
              <div
                className="flex items-center gap-4 px-4 py-2 border-t text-xs"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                <span><kbd style={{ fontSize: '0.65rem' }}>↑↓</kbd> navegar</span>
                <span><kbd style={{ fontSize: '0.65rem' }}>Enter</kbd> abrir</span>
                <span><kbd style={{ fontSize: '0.65rem' }}>Esc</kbd> fechar</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
