/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a12',
          elevated: '#10101a',
          card: '#141421',
          'card-hover': '#1a1a2a',
        },
        surface: '#1c1c2e',
        border: {
          DEFAULT: '#252538',
          light: '#2e2e45',
        },
        accent: {
          DEFAULT: '#a855f7',
          light: '#c084fc',
          dim: '#7c3aed',
          glow: 'rgba(168, 85, 247, 0.15)',
          subtle: 'rgba(168, 85, 247, 0.06)',
        },
        negative: '#ef4444',
        positive: '#10b981',
        muted: '#9ca3af',
        white: '#f0f0f8',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
        'scroll-line': 'scroll-line 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% center' },
          '50%': { backgroundPosition: '100% center' },
        },
        'scroll-line': {
          '0%': { opacity: '0', transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%': { opacity: '1', transform: 'scaleY(1)', transformOrigin: 'top' },
          '50.01%': { transformOrigin: 'bottom' },
          '100%': { opacity: '0', transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
