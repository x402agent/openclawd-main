/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solana: {
          400: '#14F195',
          500: '#00FFA3',
          600: '#00D68F',
        },
        clawd: {
          purple: '#7C3AED',
          'purple-dark': '#6D28D9',
          pink: '#EC4899',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
