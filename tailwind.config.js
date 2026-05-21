/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'tc-blue':  '#065990',
        'tc-mid':   '#044e7a',
        'tc-deep':  '#022b52',
        'tc-lime':  '#EAFF00',
        'tc-bg':    '#F3F6FB',
        'tc-text':  '#0A1628',
        'tc-text2': '#4A567A',
        'tc-text3': '#8A94AA',
        'tc-border':'#E0E9F2',
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
