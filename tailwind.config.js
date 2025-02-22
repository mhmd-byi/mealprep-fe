/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
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

