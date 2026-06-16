/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--theme-page) / <alpha-value>)',
        surface: 'rgb(var(--theme-surface) / <alpha-value>)',
        elevated: 'rgb(var(--theme-elevated) / <alpha-value>)',
        line: 'rgb(var(--theme-line) / <alpha-value>)',
        text: 'rgb(var(--theme-text) / <alpha-value>)',
        muted: 'rgb(var(--theme-muted) / <alpha-value>)',
        ink: {
          50: '#f8fafc',
          100: '#eef2f7',
          200: '#d9e0ea',
          300: '#b7c2d2',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          900: '#101828'
        },
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#2f6fed',
          600: '#1f5fd6',
          700: '#184fb7'
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.06), 0 10px 30px rgba(16,24,40,.06)',
        lift: '0 18px 50px rgba(16,24,40,.12)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
