import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#F0F2F6', // Soft light blue-grey
          card: '#FFFFFF',
          input: '#E6E9EF', // Slightly darker for inset
        },
        primary: {
          light: '#A78BFA',
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9',
        },
        text: {
          primary: '#1E293B', // Slate 800
          secondary: '#64748B', // Slate 500
          value: '#334155', // Slate 700
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'gradient-bg': 'linear-gradient(to bottom, #F0F2F6, #E2E8F0)',
        'gradient-card': 'linear-gradient(145deg, #ffffff, #f0f0f3)',
      },
      boxShadow: {
        'soft-out': '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff, 5px 5px 10px rgba(0,0,0,0.05)',
        'soft-out-sm': '5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff',
        'soft-in': 'inset 5px 5px 10px #d1d5db, inset -5px -5px 10px #ffffff',
        'float': '0 10px 40px -10px rgba(0,0,0,0.15)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.5)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
};
export default config;
