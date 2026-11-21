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
        red: {
          DEFAULT: "#E11D48",
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        studio: {
          black: "#050709",
          deep: "#080D18",
          card: "#0F1623",
          cardHover: "#141B2A",
          border: "#1A2435",
          borderHover: "#2C3B52",
          red: "#E11D48",
          emerald: "#10B981",
          rose: "#E11D48",
          amber: "#F59E0B",
          text: "#F8FAFC",
          muted: "#8493A8",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        redGlow: "0 0 25px rgba(225, 29, 72, 0.25)",
        redSubtle: "0 0 15px rgba(225, 29, 72, 0.12)",
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
