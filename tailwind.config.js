/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Inter"', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['"Google Sans Mono"', '"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
      },
      colors: {
        google: {
          blue: '#1a73e8',
          'blue-hover': '#1765cc',
          'blue-light': '#e8f0fe',
          'blue-surface': '#d2e3fc',
          red: '#d93025',
          green: '#137333',
          yellow: '#f9ab00',
          text: '#202124',
          'text-secondary': '#5f6368',
          'text-tertiary': '#80868b',
          outline: '#dadce0',
          'outline-strong': '#c4c7c9',
          surface: '#ffffff',
          'surface-dim': '#f8f9fa',
          'surface-container': '#f1f3f4',
          'surface-variant': '#e8eaed',
        },
      },
      boxShadow: {
        'g-1': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'g-2': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        'g-3': '0 4px 8px 0 rgba(60,64,67,0.3), 0 8px 16px 4px rgba(60,64,67,0.15)',
        'g-focus': '0 0 0 2px #e8f0fe',
      },
      borderRadius: {
        'g-sm': '8px',
        'g': '12px',
        'g-lg': '16px',
        'g-xl': '28px',
      },
    },
  },
  plugins: [],
};
