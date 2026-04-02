// Load all chapter markdown files as raw strings via Vite's ?raw import
// The @chapters alias points to ../book/chapters (configured in vite.config.ts)
// HMR works automatically in dev mode when .md files change

const modules = import.meta.glob('@chapters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Build a lookup map: chapter id → raw markdown string
// e.g. '01_introducao' → '# Introdução\n...'
const chapterContent: Record<string, string> = {}

for (const [path, content] of Object.entries(modules)) {
  // Extract filename stem from path like '/.../.../01_introducao.md'
  const filename = path.split('/').pop()?.replace('.md', '') ?? ''
  if (filename) {
    chapterContent[filename] = content as string
  }
}

export function getChapterContent(id: string): string {
  return chapterContent[id] ?? `# Capítulo não encontrado\n\nO capítulo "${id}" não foi localizado.`
}
