/** @type {import('tailwindcss').Config} */
module.exports = {
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
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        custom: ["CustomFont", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Main color palette
        dark: "#0D0D0D", // Main background color
        primary: "#FFFFFF", // Primary text color (headings, main text)
        secondary: "#B3B3B3", // Secondary text color (subtext, descriptions)
        gray: "#1A1A1A", // Card background color, secondary background sections, or dividers
        shadow: "#A238FF", // Shadow color for cards, modals, or other elements

        // Gradient and highlight colors from logo
        purple: "#A238FF", // Primary button background, important highlights (replaces pink)
        softOrange: "#FF8C42", // Secondary button background, accent highlights (faded orange from logo)

        // Interaction colors
        hoverPurple: "#7F1ECC", // Hover state for primary buttons, links, and icons (slightly lighter purple)

        // Status and alert colors
        green: "#00C851", // Success messages, notifications
        yellow: "#FFBB33", // Warning alerts
        red: "#FF4444", // Error alerts or destructive actions
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
