import type en from './en'

/**
 * Typed translation keys: `t('game.round')` is checked at compile time, and a
 * key missing from a bundle is a type error rather than a runtime fallback.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
    }
  }
}
