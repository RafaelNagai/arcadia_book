import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const components: Components = {
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
