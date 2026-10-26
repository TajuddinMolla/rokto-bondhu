import bn from "@/messages/bn.json";
import en from "@/messages/en.json";
import { defaultLocale, type Locale } from "@/i18n/config";

export type TranslationDictionary = typeof bn;

const dictionaries: Record<Locale, TranslationDictionary> = {
  bn,
  en,
};

/**
 * Synchronous dictionary lookup by locale.
 * Performs zero asynchronous roundtrips, ensuring zero hydration delay.
 */
export function getTranslations(locale?: Locale): TranslationDictionary {
  if (locale && locale in dictionaries) {
    return dictionaries[locale];
  }
  return dictionaries[defaultLocale];
}
