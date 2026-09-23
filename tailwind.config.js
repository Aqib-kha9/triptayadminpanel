/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF5A5F",
          hover: "#E04F54",
          light: "#FFF1F2",
        },
        secondary: "#008489",
      },
    },
  },
  plugins: [],
}
