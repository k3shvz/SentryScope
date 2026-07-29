/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--theme-base, #070B14)',
        'base-soft': 'var(--theme-base-soft, #0B1120)',
        card: 'var(--theme-card, #101827)',
        'card-hover': 'var(--theme-card-hover, #141F33)',
        border: 'var(--theme-border, #1E293B)',
        'border-strong': 'var(--theme-border-strong, #334155)',
        accent: {
          DEFAULT: 'var(--theme-accent, #00E5FF)',
          dim: 'var(--theme-accent-dim, #00A8BF)',
        },
        secondary: {
          DEFAULT: 'var(--theme-secondary, #4ADE80)',
          dim: 'var(--theme-secondary-dim, #2FAE64)',
        },
        danger: {
          DEFAULT: 'var(--theme-danger, #FF5D73)',
          dim: 'var(--theme-danger-dim, #E64C5F)',
        },
        warning: {
          DEFAULT: 'var(--theme-warning, #F59E0B)',
          dim: 'var(--theme-warning-dim, #D97706)',
        },
        text: {
          DEFAULT: 'var(--theme-text, #F8FAFC)',
          muted: 'var(--theme-text-muted, #94A3B8)',
          faint: 'var(--theme-text-faint, #5B6B85)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px var(--theme-accent-glow)',
        'glow-strong': '0 0 40px var(--theme-accent-glow)',
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(var(--theme-accent-glow) 1px, transparent 1px), linear-gradient(90deg, var(--theme-accent-glow) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        float: 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        typing: 'typing 2.4s steps(30, end)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(8px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        typing: {
          from: { width: '0%' },
          to: { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};
