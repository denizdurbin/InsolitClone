/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pink:   { DEFAULT: '#ff1870', dark: '#c8005a', light: '#ff4d93' },
        brand:  '#ff1870',
        orange: '#ff6b35',
        yellow: '#ffd700',
        green:  '#00c896',
        blue:   '#4a9eff',
        purple: '#a855f7',
        dark: {
          bg:    '#0d0d12',
          alt:   '#13131e',
          card:  '#1a1a28',
          border:'#2a2a3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        float:   'float 4s ease-in-out infinite',
        'float-delay': 'float 4s ease-in-out 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
