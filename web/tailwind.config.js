/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#04060C',
        abyss:   '#0A0F1E',
        deep:    '#0F1729',
        surface: '#1A2440',
        border:  '#2A3A60',
        arcano:  '#C8922A',
        'arcano-glow': '#E8B84B',
        'arcano-dim':  '#7A5516',
        astral:  '#6B3FA0',
        'astral-glow': '#9B6FD0',
        'text-primary':   '#E8E0D0',
        'text-secondary': '#A09880',
        'text-accent':    '#C8922A',
      },
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        body:    ['EB Garamond', 'Merriweather', 'Georgia', 'serif'],
        ui:      ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'cloud-drift-slow': 'cloudDrift 80s linear infinite',
        'cloud-drift-mid':  'cloudDrift 55s linear infinite',
        'float':            'float 6s ease-in-out infinite',
        'glow-pulse':       'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        cloudDrift: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-20vw)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
