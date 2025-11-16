// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#423772',     // Violet exact de la maquette
        secondary: '#6D5BA6',   // Violet plus clair
        accent: '#FF6B35',      // Orange pour accents
      },
      fontFamily: {
        'emirates': ['Montserrat', 'sans-serif'], // Fallback pour Emirates
        'montessart': ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}