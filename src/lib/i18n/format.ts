import type { TFunction } from 'i18next'
import i18n from './index'
import en from './en'
import { cardById } from '@/game/cards'
import { cardTranslation } from '@/game/cards/translations'
import type { Card } from '@/game/cards/types'
import type { LogEntry } from '@/game/types'
import type { GameError } from '@/stores/game'

/**
 * The language the app is currently rendering in.
 *
 * Read from the i18next instance rather than the bound `t`: `getFixedT(null)`
 * binds no language, so its `lng`/`lngs` are empty and a card title taken from
 * them would always come out English.
 */
function activeLanguage(): string {
  return i18n.resolvedLanguage ?? i18n.language ?? 'en'
}

/** A card's title in the given language, falling back to its English title. */
function cardTitleFor(id: string, language: string): string {
  const english = cardById(id)?.title ?? id
  if (!language.startsWith('zh')) return english
  return cardTranslation(id)?.title ?? english
}

/**
 * Values the engine passes as raw ids and that must be translated on render.
 * `name` is deliberately absent: it always carries a player-chosen name, which
 * must never be run through the translator.
 */
const TRANSLATED_VALUES: Record<string, (value: string, t: TFunction) => string> = {
  space: (value, t) => t(`spaces.${value}.name`, value),
  // A card id resolves to the title in the active language. The language has to
  // be checked: reaching for the Chinese title unconditionally put Chinese card
  // names into English log lines.
  cardId: (value) => cardTitleFor(value, activeLanguage()),
  good: (value, t) => t(`goods.${value}`, value),
  house: (value, t) => t(`house.${value}`, value),
  resource: (value, t) => t(`goods.${value}`, value),
  material: (value, t) => t(`goods.${value}`, value),
  crop: (value, t) => t(`goods.${value}`, value),
}

/** Translate the interpolation values that are ids rather than literal text. */
function localiseValues(
  values: Record<string, string | number> | undefined,
  t: TFunction,
): Record<string, string | number> {
  if (!values) return {}

  const result: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(values)) {
    const mapper = Object.hasOwn(TRANSLATED_VALUES, key) ? TRANSLATED_VALUES[key] : undefined
    result[key] = mapper && typeof value === 'string' ? mapper(value, t) : value
  }
  return result
}

/**
 * The engine names its keys as plain strings, so the lookup is built at
 * runtime. `LogKey`/`ErrorKey` still constrain it to the keys that exist in
 * the bundles, so a typo in the engine is a type error rather than a raw key
 * rendered on screen.
 */
export type LogKey = keyof typeof en.log
export type ErrorKey = keyof typeof en.errors

/**
 * Per-key placeholder types cannot be checked when the key is only known at
 * runtime, so the lookup itself goes through an untyped call. The key unions
 * above still document and constrain what the engine may emit, and the tests
 * assert that every key the engine uses exists in both bundles.
 */
type LooseT = (key: string, values: Record<string, string | number>) => string

export function formatLogEntry(entry: LogEntry, t: TFunction): string {
  const translate = t as unknown as LooseT
  return translate(`log.${entry.key satisfies string}`, localiseValues(entry.values, t))
}

export function formatError(error: GameError, t: TFunction): string {
  const translate = t as unknown as LooseT
  return translate(`errors.${error.key satisfies string}`, localiseValues(error.values, t))
}

/**
 * A card's title and rules text in the active language.
 *
 * Cards without a hand-written Chinese translation fall back to English and
 * report `translated: false`, so the UI can say the translation is pending
 * rather than quietly showing English as if it were intentional.
 */
export function localiseCard(
  card: Pick<Card, 'id' | 'title' | 'text'>,
  language: string,
): { title: string; text: string; translated: boolean } {
  if (!language.startsWith('zh')) {
    return { title: card.title, text: card.text, translated: true }
  }

  const translation = cardTranslation(card.id)
  if (!translation) return { title: card.title, text: card.text, translated: false }

  return { title: translation.title, text: translation.text, translated: true }
}
