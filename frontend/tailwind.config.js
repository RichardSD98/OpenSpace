/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '960px',
      xl: '1200px',
      '2xl': '1440px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      fontSize: {
        'fluid-xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
        'fluid-sm': ['clamp(0.8125rem, 0.78rem + 0.2vw, 0.9375rem)', { lineHeight: '1.55' }],
        'fluid-base': ['clamp(0.9375rem, 0.88rem + 0.3vw, 1.0625rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 1rem + 0.6vw, 1.5rem)', { lineHeight: '1.4' }],
        'fluid-xl': ['clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)', { lineHeight: '1.2' }],
        'fluid-2xl': ['clamp(1.875rem, 1.4rem + 2.4vw, 3rem)', { lineHeight: '1.15' }],
        'fluid-3xl': ['clamp(2.25rem, 1.6rem + 3.2vw, 4rem)', { lineHeight: '1.1' }],
      },
      spacing: {
        'section-y': 'clamp(2.5rem, 5vw, 5rem)',
        'section-x': 'clamp(1rem, 5vw, 3rem)',
      },
      maxWidth: {
        container: '75rem',
      },
      aspectRatio: {
        portrait: '3 / 4',
        landscape: '16 / 9',
        wide: '21 / 9',
      },
    },
  },
  plugins: [],
}
