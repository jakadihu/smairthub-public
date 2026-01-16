import shared from "@smairthub/config/tailwind";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../modules/**/*.{ts,tsx}",
  ],
  ...shared,
};

export default config;
