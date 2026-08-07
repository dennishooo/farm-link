import type { TFunction } from 'i18next'
import en from './en'
import type { LogEntry } from '@/game/types'
import type { GameError } from '@/stores/game'

/**
 * Values the engine passes as raw ids and that must be translated on render.
 * `name` is deliberately absent: it always carries a player-chosen name, which
 * must never be run through the translator.
 */
const TRANSLATED_VALUES: Record<string, (value: string, t: TFunction) => string> = {
  space: (value, t) => t(`spaces.${value}.name`, value),
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
