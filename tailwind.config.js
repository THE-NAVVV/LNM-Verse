/** @type {import('tailwindcss').Config} */
export default {
  content: [
    
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lnmTeal: { DEFAULT: '#1E4D4F', dark: '#153A3C' },
        lnmMint: { DEFAULT: '#A7E8C8', light: '#DFF7EB' },
        lnmCoral: { DEFAULT: '#E88D7A', dark: '#C97363' }
      }
    },
  },
  plugins: [],
}