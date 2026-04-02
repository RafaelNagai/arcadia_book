import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { motion } from 'framer-motion'
import { slugifyHeading } from '@/data/slugify'

/* ─── Heading ID generation ──────────────────────────────────────── */

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (React.isValidElement(children)) {
    return extractText((children.props as { children?: React.ReactNode }).children)
  }
  return ''
}

function makeHeading(level: 1 | 2 | 3) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function HeadingComponent({ children, node: _node, ...props }: any) {
    const text = extractText(children)
    const id = text ? slugifyHeading(text) : undefined
    const Tag = `h${level}` as keyof JSX.IntrinsicElements
    return <Tag id={id} {...props}>{children}</Tag>
  }
}

const components: Components = {
  h1: makeHeading(1),
  h2: makeHeading(2),
  h3: makeHeading(3),
  // Animated images — cinematic full-bleed with Ken Burns entry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  img: ({ src, alt }: any) => (
    <motion.figure
      className="relative my-14 -mx-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8 }}
    >
      {/* Clip + overflow container */}
      <div
        className="relative overflow-hidden"
        style={{ clipPath: 'polygon(0 4%, 100% 0%, 100% 96%, 0% 100%)' }}
      >
        {/* Image — Ken Burns zoom-out on entry */}
        <motion.img
          src={src ?? ''}
          alt={alt ?? ''}
          initial={{ scale: 1.07 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full block"
          style={{ maxHeight: 520, objectFit: 'cover' }}
        />
        {/* Gradient — fades into page top */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, var(--color-abyss) 0%, transparent 100%)' }}
        />
        {/* Gradient — fades into page bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--color-abyss) 0%, transparent 100%)' }}
        />
        {/* Radial vignette on left/right edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 45%, rgba(4,6,12,0.6) 100%)',
          }}
        />
      </div>

      {/* Caption */}
      {alt && (
        <figcaption
          className="mt-3 text-center text-xs font-ui tracking-widest uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          — {alt} —
        </figcaption>
      )}
    </motion.figure>
  ),
  // Tables with scrollable wrapper on mobile
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full">{children}</table>
    </div>
  ),
  // Ornamental HR via CSS in typography.css
  hr: () => <hr />,
  // Open external links in new tab
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{ color: 'var(--color-arcano-glow)' }}
      className="underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
}

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="chapter-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
