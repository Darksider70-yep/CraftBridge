import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f8fafc",
        ink: "#0f172a",
        slate: "#475569",
        accent: "#0f766e",
        accentSoft: "#ccfbf1",
      },
      boxShadow: {
        card: "0 12px 30px -20px rgba(15, 23, 42, 0.35)",
      },
      borderRadius: {
        card: "1rem",
      },
      backgroundImage: {
        "grain-gradient": "radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 38%), radial-gradient(circle at bottom right, rgba(14, 116, 144, 0.14), transparent 42%)",
      },
    },
  },
  plugins: [],
};

export default config;

