/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Toyota Brand Colors
        'toyota-red': '#EB0A1E',
        'charcoal': '#1A1A1A',
        'off-white': '#F8F8F8',
        'silver-gray': '#C8C8C8',
        // Status colors
        'status-active': '#10B981',
        'status-inactive': '#6B7280',
        'status-pending': '#F59E0B',
        'status-error': '#EF4444',
        'status-success': '#10B981',
      },
      fontFamily: {
        'sans': ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'header': '600',
        'body': '400',
        'label': '500',
      },
      borderRadius: {
        'md': '6px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
}
