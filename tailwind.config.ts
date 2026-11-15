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
        primary: {
          DEFAULT: "#0B192E",
          hover: "#132742",
          dark: "#062F56",
        },
        secondary: {
          DEFAULT: "#C89543",
          hover: "#B38234",
          subtle: "#FDF8ED",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F1F5F9",
        },
        border: "#E2E8F0",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
