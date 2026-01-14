import type { LocaleCode } from "./types";
export const SUPPORTED_LOCALES: LocaleCode[] = ["hu", "en"];

export function isLocale(value: string): value is LocaleCode {
  return SUPPORTED_LOCALES.includes(value as LocaleCode);
}
