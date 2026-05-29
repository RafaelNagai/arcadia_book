import { useEffect, useRef } from 'react'
import type { DiceRollEvent } from '@/hooks/useCampaignDiceChannel'
import { LogEntry } from '@/components/character/DiceLogEntries'

interface MapDiceLogProps {
  rolls: DiceRollEvent[]
  isOpen: boolean
  unseenCount: number
  onToggle: () => void
}

export function MapDiceLog({ rolls, isOpen, unseenCount, onToggle }: MapDiceLogProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [rolls.length, isOpen])

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.5rem',
      pointerEvents: 'none',
    }}>
      {isOpen && (
        <div style={{
          width: 320,
          maxHeight: 480,
          background: 'var(--color-deep)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'auto',
          boxShadow: '-4px 4px 32px rgba(0,0,0,0.7)',
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14 }}>🎲</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '0.06em',
              flex: 1,
            }}>
              Rolagens da Sessão
            </span>
            {rolls.length > 0 && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '1px 7px',
              }}>
                {rolls.length}
              </span>
            )}
          </div>

          {/* Entries */}
          <div
            ref={listRef}
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '10px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {rolls.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingTop: 40,
                paddingBottom: 20,
              }}>
                <span style={{ fontSize: 24, opacity: 0.2 }}>🎲</span>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                }}>
                  Nenhuma rolagem ainda
                </p>
              </div>
            ) : (
              rolls.map((roll, i) => (
                <div key={`${roll.entry.id}-${i}`}>
                  {/* Character name separator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 5,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--color-arcano)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 200,
                    }}>
                      {roll.characterName}
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(200,146,42,0.15)' }} />
                  </div>
                  <LogEntry entry={roll.entry} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Fechar rolagens' : 'Ver rolagens da sessão'}
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: isOpen ? 'rgba(200,146,42,0.25)' : 'rgba(6,10,22,0.9)',
          border: `1px solid ${isOpen ? 'rgba(200,146,42,0.5)' : 'var(--color-border)'}`,
          color: isOpen ? 'var(--color-arcano)' : 'rgba(255,255,255,0.45)',
          fontSize: '1.1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          backdropFilter: 'blur(4px)',
        }}
      >
        🎲
        {!isOpen && unseenCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: '#E85030',
            color: '#fff',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>
    </div>
  )
}
