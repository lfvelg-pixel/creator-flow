/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff4f4',
          100: '#ffe0df',
          200: '#ffc1bf',
          300: '#ff9491',
          400: '#ff6b6b',
          500: '#ff3d3d',
          600: '#ed1c1c',
          700: '#c81414',
          800: '#a51515',
          900: '#891818',
        },
        cream: '#FFFAF7',
        'warm-gray': '#F5EDE8',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(255,107,107,0.08)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
        'card-hover': '0 6px 24px rgba(255,107,107,0.16)',
      },
      backgroundImage: {
        'coral-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        'yt-gradient': 'linear-gradient(135deg, #FF0000, #CC0000)',
        'tt-gradient': 'linear-gradient(135deg, #FE2C55, #25F4EE)',
        'ig-gradient': 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)',
      },
    },
  },
  plugins: [],
}
