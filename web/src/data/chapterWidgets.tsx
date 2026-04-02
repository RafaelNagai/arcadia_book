import type { ReactNode } from 'react'
import { CombatWidget } from '@/components/widgets/CombatWidget'

// Mapa de slug → componente interativo
// Para adicionar um widget a um capítulo, basta incluir aqui.
export const CHAPTER_WIDGETS: Record<string, ReactNode> = {
  'combate': <CombatWidget />,
}
