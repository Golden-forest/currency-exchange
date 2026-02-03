import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0A0A0A',
          light: '#1A1A1A',
          card: 'rgba(30, 30, 30, 0.8)',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFF8DC',
          border: 'rgba(255, 215, 0, 0.3)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'gold-intense': '0 0 30px rgba(255, 215, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;
