/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a202c',
        secondary: '#4a5568',
        accent: '#805ad5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to bottom, #0f172a, #1e293b)',
      },
      boxShadow: {
        'glow': '0 0 15px 2px rgba(167, 139, 250, 0.3)',
      },
    },
  },
  plugins: [],
} 