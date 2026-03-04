/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.dark-theme'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0A1128',
        'nebula-purple': '#7B506F',
        'nebula-pink': '#EFA8B0',
        'bright-teal': '#1EEFEF',
        'space-white': '#F4F7F7',
        'theme-accent': 'var(--theme-accent)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['monospace'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        orbitSlow: 'orbit 30s linear infinite',
        orbitFast: 'orbit 15s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};