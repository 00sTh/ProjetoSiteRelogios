import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8e8",
          100: "#faefc5",
          200: "#f5de8a",
          300: "#f0c94f",
          400: "#e8b323",
          500: "#d49a12",
          600: "#b5780c",
          700: "#91570d",
          800: "#784512",
          900: "#663915",
        },
      },
    },
  },
  plugins: [],
};

export default config;
