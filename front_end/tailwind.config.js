/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    screens:{
      'phone': { 'raw': '(max-width: 700px)' },
      'small': { 'raw': '(max-width: 550px)' },
    }
  },
  plugins: []
}