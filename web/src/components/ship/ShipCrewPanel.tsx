import { Link } from 'react-router-dom'
import type { ShipCrewMember } from '@/data/shipTypes'

export function ShipCrewPanel({ crew, currentUserId, isOwner, onRemove }: {
  crew: ShipCrewMember[]
  currentUserId?: string
  isOwner: boolean
  onRemove: (characterId: string) => void
}) {
  if (crew.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Nenhum tripulante embarcado ainda.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {crew.map(member => {
        const canView = member.isPublic || member.userId === currentUserId
        const canRemove = isOwner || member.userId === currentUserId

        const inner = (
          <div style={{
            background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4, overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ height: 140, position: 'relative', overflow: 'hidden', background: 'rgba(6,10,22,0.8)' }}>
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'radial-gradient(ellipse 80% 80% at 50% 30%, rgba(80,200,232,0.12) 0%, transparent 70%)',
                }}>
                  <span style={{ fontSize: '3.5rem', opacity: 0.14, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#50C8E8' }}>
                    {member.name[0]}
                  </span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,6,12,0.95) 0%, transparent 55%)' }} />
            </div>
            <div style={{ padding: '0.6rem 0.7rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: '#EEF4FC' }}>
                {member.name}
              </p>
              {!canView && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.15rem' }}>
                  Ficha privada
                </p>
              )}
            </div>
            {canRemove && (
              <button
                onClick={e => { e.preventDefault(); onRemove(member.characterId) }}
                title="Remover da tripulação"
                style={{
                  position: 'absolute', top: 6, right: 6, zIndex: 10,
                  background: 'rgba(4,10,20,0.85)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 4, padding: '0.15rem 0.4rem', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
                }}
                onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.color = '#C05050' }}
                onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)' }}
              >
                ✕
              </button>
            )}
          </div>
        )

        return canView ? (
          <Link key={member.id} to={`/ficha/${member.characterId}`} style={{ textDecoration: 'none' }}>
            {inner}
          </Link>
        ) : (
          <div key={member.id}>{inner}</div>
        )
      })}
    </div>
  )
}
