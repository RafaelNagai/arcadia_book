import type { ReactNode } from 'react'
import { CombatWidget } from '@/components/widgets/CombatWidget'
import { TraumaWidget } from '@/components/widgets/TraumaWidget'
import { AfinidadeWidget } from '@/components/widgets/AfinidadeWidget'
import { BestiaryWidget } from '@/components/widgets/BestiaryWidget'
import { ShipWidget } from '@/components/widgets/ShipWidget'
import { CharacterExamplesWidget } from '@/components/widgets/CharacterExamplesWidget'
import { EquipmentWidget } from '@/components/widgets/EquipmentWidget'

// Mapa de slug → componente interativo
// Para adicionar um widget a um capítulo, basta incluir aqui.
export const CHAPTER_WIDGETS: Record<string, ReactNode> = {
  'personagem':            <CharacterExamplesWidget />,
  'combate':               <CombatWidget />,
  'condicoes-e-trauma':    <TraumaWidget />,
  'elementos-e-afinidades':<AfinidadeWidget />,
  'bestiario':             <BestiaryWidget />,
  'navios':                <ShipWidget />,
  'equipamentos':          <EquipmentWidget />,
}
