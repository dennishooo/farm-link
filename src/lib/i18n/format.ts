import type { TFunction } from 'i18next'
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
    const mapper = TRANSLATED_VALUES[key]
    result[key] = mapper && typeof value === 'string' ? mapper(value, t) : value
  }
  return result
}

export function formatLogEntry(entry: LogEntry, t: TFunction): string {
  return t(`log.${entry.key}`, localiseValues(entry.values, t)) as string
}

export function formatError(error: GameError, t: TFunction): string {
  return t(`errors.${error.key}`, localiseValues(error.values, t)) as string
}
