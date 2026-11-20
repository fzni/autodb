import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: "#31bacc",
          50: "#edfcfd",
          100: "#d3f7fa",
          200: "#aceef5",
          300: "#74e0ee",
          400: "#31bacc", // User's requested theme color!
          500: "#189faf",
          600: "#167f90",
          700: "#176776",
          800: "#1a535f",
          900: "#1a4651",
          950: "#0c2e37",
        },
        studio: {
          black: "#050709",
          deep: "#090D13",
          card: "#0E131B",
          cardHover: "#131A24",
          border: "#1A2332",
          borderHover: "#2C3B52",
          cyan: "#31bacc",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B",
          text: "#F8FAFC",
          muted: "#8493A8",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        cyanGlow: "0 0 25px rgba(49, 186, 204, 0.25)",
        cyanSubtle: "0 0 15px rgba(49, 186, 204, 0.12)",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", ".light &");
    }),
  ],
};

export default config;
