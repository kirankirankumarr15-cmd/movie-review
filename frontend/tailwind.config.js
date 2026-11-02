/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cinematic dark palette
        background: {
          DEFAULT: '#0a0a0f',
          secondary: '#111118',
          tertiary: '#16161f',
        },
        surface: {
          DEFAULT: '#1a1a25',
          elevated: '#20202e',
          hover: '#252535',
        },
        border: {
          DEFAULT: '#2a2a3d',
          subtle: '#1e1e2e',
          accent: '#3d3d5c',
        },
        // Accent colors
        purple: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6332c9',
          800: '#5223a8',
          900: '#3a137b',
          950: '#1e0c4a',
        },
        lavender: {
          50:  '#faf9ff',
          100: '#f6f4fe',
          200: '#ede9fe',
          300: '#e0d8fa',
          DEFAULT: '#f8f7ff',
        },
        brand: {
          purple: '#6332c9',
          magenta: '#c026d3',
          fuchsia: '#d946ef',
          violet: '#7c3aed',
        },
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Sentiment colors
        positive: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
          bg: 'rgba(34,197,94,0.08)',
          border: 'rgba(34,197,94,0.2)',
        },
        neutral: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          bg: 'rgba(245,158,11,0.08)',
          border: 'rgba(245,158,11,0.2)',
        },
        negative: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          bg: 'rgba(239,68,68,0.08)',
          border: 'rgba(239,68,68,0.2)',
        },
        // Light mode
        light: {
          bg: '#ffffff',
          surface: '#f8f9fc',
          border: '#e2e8f0',
          text: '#0f172a',
          secondary: '#475569',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(124,58,237,0.15)',
        'glow-positive': '0 0 20px rgba(34,197,94,0.2)',
        'glow-negative': '0 0 20px rgba(239,68,68,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
