/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Violet as accent
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        sidebar: {
          bg: '#0f172a', // Slate 900
          text: '#94a3b8', // Slate 400
          hover: '#1e293b', // Slate 800
          active: '#334155', // Slate 700
          accent: '#8b5cf6',
        },
        dashboard: {
          bg: '#f8fafc', // Slate 50
          card: '#ffffff',
          border: '#e2e8f0', // Slate 200
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
