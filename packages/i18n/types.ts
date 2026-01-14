export const locales = ["hu", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "hu";
export type LocaleCode = "hu" | "en";