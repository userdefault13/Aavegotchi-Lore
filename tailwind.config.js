/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        pink: '#FF6B9D',
        'pink-dark': '#FF4A7A',
        purple: '#C084FC',
        'purple-dark': '#9333EA',
        'purple-bright': '#651FFF',
        ghst: '#651FFF',
        cyan: '#06B6D4',
        yellow: '#FCD34D',
        'dark-bg': '#1A0A2E',
        'dark-1': '#0F0B1E',
        'dark-2': '#1A142D',
        'dark-3': '#2D1B3D',
        'border-purple': '#8B7DB8',
        'border-purple-light': '#A78BFA',
        'purple-light': '#B794F6',
        fud: '#3685E3',
        fomo: '#FFA133',
        alpha: '#EB367F',
        kek: '#7F28CA',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px',
      },
    },
  },
  plugins: [],
};
