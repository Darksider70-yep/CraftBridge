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
        // Craft-inspired palette
        primary: "#c75f47", // Terracotta / clay tone
        primaryLight: "#dfa385",
        primaryDark: "#a34a34",
        
        secondary: "#e8dcc8", // Warm beige / sand
        secondaryLight: "#f5eee0",
        secondaryDark: "#d4c5b0",
        
        accent: "#1f3447", // Deep indigo
        accentLight: "#4a5f7a",
        accentLighter: "#f0f4f8",
        
        // Neutral palette
        surface: "#fafaf9",
        ink: "#1a1a1a",
        slate: "#6b7280",
        
        // Semantic colors
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        cardHover: "0 12px 32px rgba(199, 95, 71, 0.12)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        card: "1.25rem",
      },
      backgroundImage: {
        "craft-gradient": "linear-gradient(135deg, rgba(199, 95, 71, 0.05) 0%, rgba(232, 220, 200, 0.05) 100%)",
        "hero-gradient": "linear-gradient(135deg, #c75f47 0%, #a34a34 100%)",
        "accent-gradient": "linear-gradient(135deg, #1f3447 0%, #4a5f7a 100%)",
      },
      spacing: {
        full: "100%",
      },
    },
  },
  plugins: [],
};

export default config;

