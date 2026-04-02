/**
 * Converts a heading string into a URL-safe anchor ID.
 * Handles Portuguese text with accents, numbered headings, and markdown formatting.
 * Must produce identical output in both searchIndex.ts and MarkdownRenderer.tsx.
 *
 * Examples:
 *   "Defesa Ativa"       → "defesa-ativa"
 *   "Condições e Trauma" → "condicoes-e-trauma"
 *   "1. A Intenção"      → "a-intencao"
 *   "As Raças de Arcádia"→ "as-racas-de-arcadia"
 */
export function slugifyHeading(text: string): string {
  return text
    // Decompose accented chars: ã → a + combining tilde, ç → c + combining cedilla, etc.
    .normalize('NFD')
    // Strip combining diacritical marks (U+0300–U+036F)
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // Remove markdown formatting remnants: **bold**, *italic*, `code`
    .replace(/[*`_~]/g, '')
    // Replace non-alphanumeric chars (spaces, punctuation, etc.) with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}
