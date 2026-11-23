/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: withOpacity('--brand-600'),
          primary: withOpacity('--brand-primary'),
          secondary: withOpacity('--brand-secondary'),
          accent: withOpacity('--brand-accent'),
          50: withOpacity('--brand-50'),
          100: withOpacity('--brand-100'),
          200: withOpacity('--brand-200'),
          300: withOpacity('--brand-300'),
          400: withOpacity('--brand-400'),
          500: withOpacity('--brand-500'),
          600: withOpacity('--brand-600'),
          700: withOpacity('--brand-700'),
          800: withOpacity('--brand-800'),
          900: withOpacity('--brand-900'),
          950: withOpacity('--brand-950'),
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
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
