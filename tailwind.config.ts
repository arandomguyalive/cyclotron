// The current `tailwind.config.mjs` is empty. We need to replace it with the `tailwind.config.ts` version.

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Ensure all src files are covered
  ],
  theme: {
    extend: {
      colors: {
        // Define CSS variables for themeable colors
        "primary-bg": "var(--color-primary-bg)",
        "secondary-bg": "var(--color-secondary-bg)",
        "primary-text": "var(--color-primary-text)",
        "secondary-text": "var(--color-secondary-text)",
        "accent-1": "var(--color-accent-1)",
        "accent-2": "var(--color-accent-2)",
        "border-color": "var(--color-border)",
        
        // Original cyberpunk colors (can be mapped to vars later)
        "cyber-black": "#0A0A0A",
        "cyber-white": "#F0F0F0",
        "cyber-blue": "#00F0FF",
        "cyber-purple": "#8A2BE2",
        "cyber-pink": "#FF00FF",
        "cyber-red": "#FF4500",
        "cyber-green": "#00FF7F",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;