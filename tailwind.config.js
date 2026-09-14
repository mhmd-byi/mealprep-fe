/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.0625rem' }],
        sm: ['0.9375rem', { lineHeight: '1.3125rem' }],
        base: ['1.0625rem', { lineHeight: '1.5625rem' }],
        lg: ['1.1875rem', { lineHeight: '1.8125rem' }],
        xl: ['1.3125rem', { lineHeight: '1.8125rem' }],
        '2xl': ['1.5625rem', { lineHeight: '2.0625rem' }],
        '3xl': ['1.9375rem', { lineHeight: '2.3125rem' }],
        '4xl': ['2.3125rem', { lineHeight: '2.5625rem' }],
        '5xl': ['3.0625rem', { lineHeight: '1' }],
        '6xl': ['3.8125rem', { lineHeight: '1' }],
        '7xl': ['4.5625rem', { lineHeight: '1' }],
        '8xl': ['6.0625rem', { lineHeight: '1' }],
        '9xl': ['8.0625rem', { lineHeight: '1' }],
      },
      backgroundImage: {
        'theme-bg-1': "url('/src/assets/images/screenbg.png')",
        'theme-bg-2': "url('/src/assets/images/theme-bg.png')",
        'theme-bg-3': "url('/src/assets/images/theme-bg-desktop.jpg')",
        'theme-bg-4': "url('/src/assets/images/theme-bg1.png')",
      },
      colors: {
        'theme-color-1' : '#3C9B62',
        'sidebar-color-1' : '#242424'
      },
      borderRadius: {
        'theme-radius' : '1.9rem',
        'theme-radius-15' : '1.1rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin')
  ],
}

