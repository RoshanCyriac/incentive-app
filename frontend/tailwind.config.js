/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      }
    },
  },
  plugins: [],
}
