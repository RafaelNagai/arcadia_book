import type { ReactNode } from 'react'
import { CombatWidget } from '@/components/widgets/CombatWidget'
import { TraumaWidget } from '@/components/widgets/TraumaWidget'
import { AfinidadeWidget } from '@/components/widgets/AfinidadeWidget'

// Mapa de slug → componente interativo
// Para adicionar um widget a um capítulo, basta incluir aqui.
export const CHAPTER_WIDGETS: Record<string, ReactNode> = {
  'combate':               <CombatWidget />,
  'condicoes-e-trauma':    <TraumaWidget />,
  'elementos-e-afinidades':<AfinidadeWidget />,
}
