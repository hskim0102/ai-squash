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
        background: '#F0F6FF',
        foreground: '#0D1B2E',
        accent: {
          DEFAULT: '#C8F000',
          foreground: '#0D1B2E',
        },
        muted: {
          DEFAULT: '#E4ECF8',
          foreground: '#4A6080',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.85)',
          border: 'rgba(13,27,46,0.09)',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0D1B2E',
        },
        court: {
          navy: '#0D1B2E',
          line: 'rgba(13,27,46,0.12)',
          tin: '#CC3300',
          floor: 'rgba(13,27,46,0.03)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(13,27,46,0.08), 0 0 0 1px rgba(13,27,46,0.06)',
        'card-hover': '0 8px 32px rgba(13,27,46,0.14), 0 0 0 1px rgba(13,27,46,0.08)',
        'accent-glow': '0 0 24px rgba(200,240,0,0.5)',
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
          '0%, 100%': { boxShadow: '0 0 8px rgba(200,240,0,0.6)' },
          '50%': { boxShadow: '0 0 32px rgba(200,240,0,0.8), 0 0 64px rgba(200,240,0,0.3)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
