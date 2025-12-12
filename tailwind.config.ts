import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-bg": "var(--color-primary-bg)",
        "secondary-bg": "var(--color-secondary-bg)",
        "primary-text": "var(--color-primary-text)",
        "secondary-text": "var(--color-secondary-text)",
        "accent-1": "var(--color-accent-1)",
        "accent-2": "var(--color-accent-2)",
        "border-color": "var(--color-border)",
        
        // KM18 Brand Palette
        "brand-orange": "#EB7955",
        "brand-pale-pink": "#FFCDEC",
        "brand-hot-pink": "#FF53B2",
        "brand-purple": "#6B0098",
        "brand-blue": "#006096",
        "brand-cyan": "#00D4E5",

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
