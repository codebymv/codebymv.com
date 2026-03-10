/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.dark-theme'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-subtle': 'var(--bg-subtle)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
