
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/dashboard/app/**/*.{ts,tsx}",
    "./apps/dashboard/components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}"    
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
