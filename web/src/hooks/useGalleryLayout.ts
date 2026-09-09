import { useCallback, useEffect, useState, type RefObject } from 'react'

export interface GalleryLayout {
  cols: number
  tileWidth: number
  tileHeight: number
}

export const GALLERY_GAP = 16
const ASPECT_RATIO = 16 / 9

function computeLayout(containerWidth: number, containerHeight: number, count: number): GalleryLayout | null {
  if (count <= 0 || containerWidth <= 0 || containerHeight <= 0) return null
  let best: GalleryLayout | null = null
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols)
    let tileWidth = (containerWidth - GALLERY_GAP * (cols - 1)) / cols
    let tileHeight = tileWidth / ASPECT_RATIO
    if (tileHeight * rows + GALLERY_GAP * (rows - 1) > containerHeight) {
      tileHeight = (containerHeight - GALLERY_GAP * (rows - 1)) / rows
      tileWidth = tileHeight * ASPECT_RATIO
    }
    if (tileWidth <= 0 || tileHeight <= 0) continue
    const area = tileWidth * tileHeight
    if (!best || area > best.tileWidth * best.tileHeight) best = { cols, tileWidth, tileHeight }
  }
  return best
}

// Não usamos auto-fill/minmax nem Math.ceil(Math.sqrt(n)) genérico: ambos ignoram
// a proporção real do container. Testamos cada `cols` de 1 até `count`, calculamos
// o tile que cabe por largura E por altura, e escolhemos o `cols` que maximiza a
// área por tile — como a contagem é fixa, isso também maximiza o uso do espaço.
export function useGalleryLayout(containerRef: RefObject<HTMLElement | null>, count: number): GalleryLayout | null {
  const [layout, setLayout] = useState<GalleryLayout | null>(null)

  const recompute = useCallback((width: number, height: number) => {
    setLayout(computeLayout(width, height, count))
  }, [count])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // observe() já dispara uma notificação inicial com o tamanho atual (sem
    // precisar de um resize de verdade), igual ao padrão usado em
    // MapTab.tsx/EmberParticles.tsx — reagir só dentro do callback do
    // ResizeObserver (nunca chamando setState direto no corpo do efeito).
    // `recompute` muda de identidade quando `count` muda, o que já reconecta
    // este observer e recalcula pela nova contagem, sem precisar de um
    // segundo efeito dedicado a `[count]`.
    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      recompute(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef, recompute])

  return layout
}
