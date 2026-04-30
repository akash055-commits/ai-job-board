import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        shell: "#f5f7f3",
        mint: "#cef1c9",
        teal: "#125b50",
        amber: "#d97706",
        coral: "#ef4444"
      },
      boxShadow: {
        card: "0 24px 80px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
