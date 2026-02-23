import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8e8",
          100: "#faefc5",
          200: "#f5df8a",
          300: "#f0cf4f",
          400: "#ebc327",
          500: "#d4a913",
          600: "#a7840d",
          700: "#7a6010",
          800: "#4d3d14",
          900: "#2a2110",
        },
      },
    },
  },
  plugins: [],
};

export default config;
