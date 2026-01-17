import hu from "./i18n/hu.json"
import en from "./i18n/en.json"

const dict = { hu, en }

export function useI18n(locale: string) {
  return dict[locale] || dict.hu
}
