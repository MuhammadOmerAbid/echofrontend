import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:   "#111210",
        ink2:  "#1e1f1b",
        paper: "#f7f5ef",
        warm:  "#ede9e0",
        sage:  "#e8580a",
        sage2: "#f97316",
        leaf:  "#fff1e6",
        stone: "#8c897f",
        cream: "#faf9f5",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        serif:   ["var(--font-serif)", "Georgia", "serif"],
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
