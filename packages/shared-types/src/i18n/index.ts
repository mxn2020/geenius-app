import { en, type Translations } from "./en"
import { de } from "./de"

export type { Translations }
export type Locale = "en" | "de"

const locales: Record<Locale, Translations> = { en, de }

let currentLocale: Locale = "en"

export function setLocale(locale: Locale) {
  currentLocale = locale
}

export function getLocale(): Locale {
  return currentLocale
}

export function t<
  S extends keyof Translations,
  K extends keyof Translations[S],
>(section: S, key: K): Translations[S][K] {
  return locales[currentLocale][section][key]
}

export { en, de }
