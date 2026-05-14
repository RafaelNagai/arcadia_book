import rawEvents from '@timeline'

export type Era =
  | 'Período Existencial'
  | 'Era Zero'
  | 'Era Expansão'
  | 'Era Imperial'
  | 'Era Zohar'

export interface TimelineEvent {
  id: string
  era: Era
  title: string
  description: string
  year: string
  image?: string | null
  isRpgCampaign?: boolean
  isVisible?: boolean
}

export const TIMELINE_EVENTS: TimelineEvent[] = rawEvents as TimelineEvent[]

export const ERAS: Era[] = [
  'Período Existencial',
  'Era Zero',
  'Era Expansão',
  'Era Imperial',
  'Era Zohar',
]
