export interface ShipSector {
  name: string
  category: 'Armamento' | 'Casco' | 'Velas' | 'Radar' | 'Dormitório' | 'Cozinha' | 'Biblioteca' | 'Armazém'
  slots: number
  effect: string
  test: string
}

export interface Ship {
  name: string
  type: string
  size: 'Esquife' | 'Corveta' | 'Fragata' | 'Galeão' | 'Leviatã'
  image: string | null
  lore: string
  hp: number
  dn: number
  slots: { total: number; used: number }
  captainAttribute: 'Destreza' | 'Influência'
  sectors: ShipSector[]
  traits: string[]
}
