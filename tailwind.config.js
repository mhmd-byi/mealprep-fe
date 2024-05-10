/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'theme-bg-1': "url('/src/assets/images/screenbg.png')",
        'theme-bg-2': "url('/src/assets/images/theme-bg.png')",
      },
      colors: {
        'theme-color-1' : '#3C9B62'
      },
      borderRadius: {
        'theme-radius' : '1.9rem',
        'theme-radius-15' : '1.1rem',
      }
    },
  },
  plugins: [],
}

