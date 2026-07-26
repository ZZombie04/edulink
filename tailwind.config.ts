import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          panel: "var(--surface-panel)",
          strong: "var(--surface-panel-strong)",
          contrast: "var(--surface-contrast)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          muted: "var(--ink-muted)",
        },
        outline: {
          DEFAULT: "var(--outline)",
          strong: "var(--outline-strong)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "var(--primary-soft)",
          100: "var(--primary-soft)",
          200: "#c3d8cb",
          300: "#9bbca8",
          400: "#5e8e74",
          500: "var(--primary-solid)",
          600: "var(--primary-strong)",
          700: "#103c30",
          800: "#0b2f26",
          900: "#071f19",
          soft: "var(--primary-soft)",
          strong: "var(--primary-strong)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "var(--secondary-soft)",
          100: "var(--secondary-soft)",
          200: "#d5e3d8",
          400: "#7da089",
          500: "var(--secondary-solid)",
          600: "#456752",
          700: "#345241",
          soft: "var(--secondary-soft)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary-solid)",
          soft: "var(--tertiary-soft)",
        },
        status: {
          seeking: "#2f7355",
          interviewing: "#a87328",
          employed: "#466858",
          notSeeking: "#6e7772",
          reserved: "#7c6240",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        panel: "var(--shadow-card)",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          ...defaultTheme.fontFamily.sans,
        ],
        heading: [
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
