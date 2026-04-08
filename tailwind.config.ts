// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#FAFAFA',
        accent: {
          DEFAULT: '#D4FF00',
          foreground: '#0A0A0A',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
        },
        card: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          foreground: '#FAFAFA',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'bounce-ball': 'bounceBall 0.8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        bounceBall: {
          '0%, 100%': { transform: 'translateY(0)', animationTimingFunction: 'ease-in' },
          '50%': { transform: 'translateY(-40px)', animationTimingFunction: 'ease-out' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px #D4FF00' },
          '50%': { boxShadow: '0 0 24px #D4FF00, 0 0 48px #D4FF0040' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
