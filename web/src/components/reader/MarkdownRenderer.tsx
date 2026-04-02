import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
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
