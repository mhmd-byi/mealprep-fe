/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.125rem' }],
        sm: ['1rem', { lineHeight: '1.375rem' }],
        base: ['1.125rem', { lineHeight: '1.625rem' }],
        lg: ['1.25rem', { lineHeight: '1.875rem' }],
        xl: ['1.375rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.625rem', { lineHeight: '2.125rem' }],
        '3xl': ['2rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.375rem', { lineHeight: '2.625rem' }],
        '5xl': ['3.125rem', { lineHeight: '1' }],
        '6xl': ['3.875rem', { lineHeight: '1' }],
        '7xl': ['4.625rem', { lineHeight: '1' }],
        '8xl': ['6.125rem', { lineHeight: '1' }],
        '9xl': ['8.125rem', { lineHeight: '1' }],
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

