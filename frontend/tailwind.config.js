/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#23262B",
        paper: "#F2F4F1",
        board: {
          DEFAULT: "#1F4B4C",
          light: "#2C6566",
          dark: "#123333",
        },
        pencil: {
          DEFAULT: "#E8A33D",
          light: "#F6C77A",
        },
        success: "#4C9A6A",
        danger: "#D6604F",
        info: "#3E7CB1",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31,75,76,0.06), 0 4px 12px rgba(31,75,76,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
