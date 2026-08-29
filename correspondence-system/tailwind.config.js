/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#1b365d',
          600: '#152c4d',
          700: '#0f1f38',
          800: '#0a1424',
          900: '#050a12',
        }
      }
    },
  },
  plugins: [],
}
