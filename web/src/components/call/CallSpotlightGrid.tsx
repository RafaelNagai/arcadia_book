import type { CSSProperties } from 'react'
import type { GalleryLayout } from '@/hooks/useGalleryLayout'
import type { LayoutMode } from '@/hooks/useCampaignCallChannel'
import type { CallTileData } from './callTypes'

export function isSpotlightActive(layoutMode: LayoutMode, masterTile: CallTileData | undefined): boolean {
  return layoutMode === 'spotlight' && !!masterTile
}

// CallTab.tsx sempre renderiza os mesmos dois grupos de tiles (mestre e
// outros), e cada tile sempre fica dentro do mesmo wrapper (masterWrapper ou
// othersWrapper) — quem é mestre não muda com o modo de layout. Só o CSS
// desses wrappers muda entre spotlight e galeria: em galeria, `display:
// contents` "desliga" o agrupamento visual (os tiles viram itens diretos do
// grid único), e a prop `order` devolve a ordem original de `videoTiles`. Em
// spotlight, os wrappers viram duas linhas empilhadas (mestre em cima, outros
// embaixo, com scroll horizontal no mobile). Como nenhum tile troca de pai
// react entre os modos, a troca de layout continua sendo puramente visual,
// sem mount/unmount.

export function getMasterWrapperStyle(spotlightActive: boolean): CSSProperties {
  return spotlightActive
    ? { width: '100%', maxWidth: 900, margin: '0 auto', flexShrink: 0 }
    : { display: 'contents' }
}

export function getOthersWrapperClassName(spotlightActive: boolean): string | undefined {
  return spotlightActive
    ? 'flex gap-3 flex-nowrap overflow-x-auto lg:flex-wrap lg:overflow-x-visible lg:justify-center'
    : undefined
}

export function getOthersWrapperStyle(spotlightActive: boolean): CSSProperties | undefined {
  return spotlightActive ? undefined : { display: 'contents' }
}

export function getOtherTileClassName(spotlightActive: boolean): string | undefined {
  return spotlightActive ? 'w-[140px] shrink-0 lg:w-[190px]' : undefined
}

export function getTileWrapperStyle(
  spotlightActive: boolean,
  galleryLayout: GalleryLayout | null,
  order: number,
): CSSProperties {
  if (spotlightActive) return {}
  return galleryLayout
    ? { order, width: galleryLayout.tileWidth, height: galleryLayout.tileHeight, flexShrink: 0 }
    : { order, width: 240, flex: '0 1 240px' }
}
