import { BookOpen } from 'lucide-react'

interface FloatingDiaryButtonProps {
  accentColor: string
  onClick: () => void
}

export function FloatingDiaryButton({ accentColor, onClick }: FloatingDiaryButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Abrir diário"
      style={{
        position: 'fixed',
        bottom: 92,
        right: 28,
        zIndex: 80,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: `linear-gradient(135deg, rgba(20,30,55,0.95), rgba(4,10,20,0.95))`,
        border: `1px solid ${accentColor}55`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accentColor}33`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = `0 6px 32px rgba(0,0,0,0.6), 0 0 24px ${accentColor}55`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), 0 0 16px ${accentColor}33`
      }}
    >
      <BookOpen size={22} style={{ color: accentColor }} />
    </button>
  )
}
