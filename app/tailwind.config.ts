/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "#FFFEF2",
          bg2: "#F5F3E8",
          surface: "#FFFFFF",
          text: "#0A0A0A",
          text2: "#4A4A4A",
          text3: "#8A8A8A",
          green: "#00E58A",
          "green-dark": "#00B86E",
          lime: "#BFFF00",
          pink: "#FF3366",
          yellow: "#FFD700",
          blue: "#3B82F6",
          border: "#0A0A0A",
          "border-light": "#D4D0C8",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        body: ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        neo: "3px",
      },
      boxShadow: {
        neo: "5px 5px 0px #0A0A0A",
        "neo-green": "5px 5px 0px #00B86E",
        "neo-pink": "5px 5px 0px #FF3366",
        "neo-sm": "3px 3px 0px #0A0A0A",
        "neo-hover": "7px 7px 0px #0A0A0A",
        "neo-active": "1px 1px 0px #0A0A0A",
      },
    },
  },
  plugins: [],
};
