/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand-600, #4f46e5)',
          primary: 'var(--brand-primary, #4f46e5)',
          secondary: 'var(--brand-secondary, #312e81)',
          accent: 'var(--brand-accent, #f59e0b)',
          50: 'var(--brand-50, #f5f3ff)',
          100: 'var(--brand-100, #ede9fe)',
          200: 'var(--brand-200, #ddd6fe)',
          300: 'var(--brand-300, #c4b5fd)',
          400: 'var(--brand-400, #818cf8)',
          500: 'var(--brand-500, #6366f1)',
          600: 'var(--brand-600, #4f46e5)',
          700: 'var(--brand-700, #4338ca)',
          800: 'var(--brand-800, #3730a3)',
          900: 'var(--brand-900, #312e81)',
          950: 'var(--brand-950, #1e1b4b)',
        },
        surface: {
          50: '#f8fafc',  // Slate 50 canvas
          100: '#f1f5f9', // Slate 100 card outlines
          200: '#e2e8f0',
        }
      },
      boxShadow: {
        'soft': '0 2px 12px -1px rgba(0, 0, 0, 0.03), 0 4px 30px -2px rgba(0, 0, 0, 0.01)',
        'premium': '0 0 0 1px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.01), 0 16px 32px -4px rgba(0, 0, 0, 0.04)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
