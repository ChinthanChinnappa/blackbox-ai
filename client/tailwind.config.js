/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0a',
          dark: '#111111',
          card: '#161616',
          border: '#1f1f1f',
          green: '#00ff88',
          'green-dim': '#00cc6a',
          red: '#ff3366',
          yellow: '#ffcc00',
          blue: '#00aaff',
          gray: '#888888',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
