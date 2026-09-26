import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#0A0A0F',
          card: '#111118',
          elevated: '#1A1A24',
        },
        primary: {
          DEFAULT: '#FF6B00',
          light: '#FF9500',
          dark: '#E55A00',
        },
        accent: {
          red: '#FF4500',
          gold: '#FFD700',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0B8',
          muted: '#60607A',
        },
        border: {
          subtle: 'rgba(255,255,255,0.08)',
          focused: 'rgba(255,107,0,0.3)',
        },
        success: '#00D68F',
        error: '#FF4757',
        warning: '#FFB300',
      },
      fontFamily: {
        sans: ['Syne', 'Inter', 'sans-serif'],
        body: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B00, #FF9500)',
        'gradient-hero': 'radial-gradient(ellipse at top left, rgba(255,107,0,0.15) 0%, transparent 60%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      },
      borderRadius: {
        card: '16px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(255,107,0,0.2)',
        'glow-lg': '0 0 60px rgba(255,107,0,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'count-up': 'countUp 1s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
