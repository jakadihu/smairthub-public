
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/dashboard/app/**/*.{ts,tsx}",
    "./apps/dashboard/components/**/*.{ts,tsx}",
    "./panels/**/*.{ts,tsx}"    
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
