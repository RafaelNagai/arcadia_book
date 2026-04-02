import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { getChapterBySlug, getAdjacentChapters } from '@/data/chapterManifest'
import { getChapterContent } from '@/data/chapterLoader'
import { MarkdownRenderer } from '@/components/reader/MarkdownRenderer'
import { CHAPTER_WIDGETS } from '@/data/chapterWidgets'

export function ChapterPage() {
  const { slug } = useParams<{ slug: string }>()

  const chapter = slug ? getChapterBySlug(slug) : undefined
  const { prev, next } = slug ? getAdjacentChapters(slug) : { prev: null, next: null }
  const content = chapter ? getChapterContent(chapter.id) : '# Capítulo não encontrado'

  // Scroll to top on chapter change
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  // Update document title
  useEffect(() => {
    document.title = chapter ? `${chapter.title} — Arcádia` : 'Arcádia'
  }, [chapter])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: 'var(--color-abyss)' }}
    >
      {/* Chapter header illustration area */}
      <div
        className="w-full h-32 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--color-deep) 0%, var(--color-abyss) 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Optional: chapter illustration image */}
        {chapter && (
          <img
            src={`/assets/images/chapters/${String(chapter.order).padStart(2, '0')}.jpg`}
            alt=""
            className="w-full h-full object-cover opacity-20"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        {/* Part label */}
        {chapter && (
          <div className="absolute inset-0 flex flex-col items-start justify-end px-8 pb-4">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
            >
              {chapter.part}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <MarkdownRenderer content={content} />

        {/* Interactive widget for this chapter (if any) */}
        {slug && CHAPTER_WIDGETS[slug] && (
          <div className="mt-16">
            <div
              className="flex items-center gap-3 mb-6"
              style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}
            >
              <span style={{ color: 'var(--color-arcano)', fontSize: '0.9rem' }}>◈</span>
              <p
                className="text-xs uppercase tracking-widest font-ui font-semibold"
                style={{ color: 'var(--color-arcano-dim)' }}
              >
                Aprenda na Prática
              </p>
            </div>
            {CHAPTER_WIDGETS[slug]}
          </div>
        )}

        {/* Prev / Next navigation */}
        <nav
          className="mt-16 pt-8 border-t flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {prev ? (
            <Link
              to={`/capitulo/${prev.slug}`}
              className="group flex flex-col max-w-[45%] transition-opacity hover:opacity-80"
            >
              <span
                className="text-xs mb-1 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                ← Anterior
              </span>
              <span
                className="font-display text-sm font-medium"
                style={{ color: 'var(--color-arcano-glow)' }}
              >
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              to={`/capitulo/${next.slug}`}
              className="group flex flex-col items-end max-w-[45%] text-right transition-opacity hover:opacity-80"
            >
              <span
                className="text-xs mb-1 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)' }}
              >
                Próximo →
              </span>
              <span
                className="font-display text-sm font-medium"
                style={{ color: 'var(--color-arcano-glow)' }}
              >
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </motion.div>
  )
}
