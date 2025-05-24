/** @type {import('tailwindcss').Config} */
// tailwind.config.js
import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  plugins: [daisyui],
  daisyui: {
    themes: ["light"], // or your preferred theme
  },
};
