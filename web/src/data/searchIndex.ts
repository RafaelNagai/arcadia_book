import { CHAPTERS } from './chapterManifest'
import type { Part } from './chapterManifest'
import { getChapterContent } from './chapterLoader'
import { slugifyHeading } from './slugify'

/* ─── Types ─────────────────────────────────────────────────────── */

export interface SearchEntry {
  chapterId: string
  chapterSlug: string
  chapterTitle: string
  part: Part
  order: number
  headingLevel: 1 | 2 | 3
  headingText: string
  /** Empty string for H1 (links to chapter top). Slugified for H2/H3. */
  anchorId: string
  /** Up to 160 chars of paragraph text after the heading. */
  preview: string
}

export interface SearchResult {
  entry: SearchEntry
  score: number
}

/* ─── Markdown parser ────────────────────────────────────────────── */

/** Strip inline markdown formatting from a line for display/preview. */
function stripInline(line: string): string {
  return line
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim()
}

function parseChapterSections(rawMd: string, chapter: { id: string; slug: string; title: string; part: Part; order: number }): SearchEntry[] {
  const entries: SearchEntry[] = []
  const lines = rawMd.split('\n')

  let currentLevel: 1 | 2 | 3 | null = null
  let currentHeading = ''
  let currentAnchor = ''
  let previewParts: string[] = []

  const flush = () => {
    if (currentLevel === null) return
    const preview = previewParts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 160)
    entries.push({
      chapterId: chapter.id,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      part: chapter.part,
      order: chapter.order,
      headingLevel: currentLevel,
      headingText: currentHeading,
      anchorId: currentAnchor,
      preview,
    })
    previewParts = []
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      flush()
      const level = headingMatch[1].length as 1 | 2 | 3
      const rawText = headingMatch[2].replace(/[*`_~]/g, '').trim()
      currentLevel = level
      currentHeading = rawText
      currentAnchor = level === 1 ? '' : slugifyHeading(rawText)
      continue
    }

    // Collect preview text: skip table rows, HR, code fences, empty lines
    if (
      currentLevel !== null &&
      previewParts.join(' ').length < 160 &&
      !line.startsWith('|') &&
      !line.startsWith('>') &&
      !line.startsWith('---') &&
      !line.startsWith('```') &&
      !line.startsWith('#') &&
      line.trim().length > 0
    ) {
      const clean = stripInline(line)
      if (clean.length > 0) previewParts.push(clean)
    }
  }

  flush()
  return entries
}

/* ─── Index (evaluated once at module load) ──────────────────────── */

export const SEARCH_INDEX: SearchEntry[] = CHAPTERS.flatMap(chapter =>
  parseChapterSections(getChapterContent(chapter.id), chapter)
)

/* ─── Search ─────────────────────────────────────────────────────── */

/** Normalize a string for accent-insensitive matching. */
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function searchEntries(query: string): SearchResult[] {
  const q = query.trim()
  if (!q) return []

  const nq = normalize(q)

  const results: SearchResult[] = []

  for (const entry of SEARCH_INDEX) {
    const nHeading = normalize(entry.headingText)
    const nTitle   = normalize(entry.chapterTitle)
    const nPreview = normalize(entry.preview)

    let score = 0

    if (nHeading.includes(nq)) {
      score = nHeading.startsWith(nq) ? 100 : 80
    } else if (nTitle.includes(nq)) {
      score = 60
    } else if (nPreview.includes(nq)) {
      score = 40
    }

    if (score > 0) {
      results.push({ entry, score })
    }
  }

  return results
    .sort((a, b) => b.score - a.score || a.entry.order - b.entry.order)
    .slice(0, 20)
}
