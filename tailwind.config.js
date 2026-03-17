/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        jost: ['Jost', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto Mono', 'monospace'],
      },
      colors: {
        "dark-sunset": "#2a2222",
        "sunset-orange": "#ffb16a",
        "sunset-dark": "#35302e",
        "navy-dark": "#003A5D",
        "gray-light": "#9A9AB0",
        "blue-light": "#5CA5D1",
        "blue-light-500": "#518aad",
        "gray-light-50": "#EAEAEA",
        "gray-dark": "#292D32"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
