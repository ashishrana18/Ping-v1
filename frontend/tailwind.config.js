/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "oklch(92% 0.2653 125)",
        secondary: "oklch(83.27% 0.0764 298.3)",
        neutral: "oklch(30% 0.08 209)",
        info: "oklch(74% 0.16 232.661)",
        success: "oklch(79% 0.209 151.711)",
        accent: "#15A087",
        text: "#D6EDEB",
        subtext: "#9ABBB9",
        panel: "#152525",
        another: "oklch(15% 0.09 281.288)"
      }
    }
  },
  plugins: []
};
