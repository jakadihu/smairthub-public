import hu from "./i18n/hu.json"
import en from "./i18n/en.json"

const dict = { hu, en }

export function useI18n(locale: string) {
  const selected = dict[locale] || dict.hu

  return (key: string) => {
    const parts = key.split(".")
    let value: any = selected

    for (const p of parts) {
      value = value?.[p]
    }

    return value ?? key
  }
}
