import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en'
import zhHK from './zh-HK'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-HK', label: '繁體中文' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-HK': { translation: zhHK },
      // Any zh-* variant i18next narrows to plain 'zh' lands on Traditional.
      zh: { translation: zhHK },
    },
    fallbackLng: 'en',
    // 'zh' is listed so a browser reporting plain Chinese, or any zh-* variant
    // i18next strips down to it, still resolves to the Traditional bundle
    // rather than silently falling back to English.
    supportedLngs: [...SUPPORTED_LANGUAGES.map((language) => language.code), 'zh'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'farmlink-lang',
    },
  })

export default i18n
