/**
 * Parsers that turn the community card database's free-text fields into the
 * typed shapes the engine uses. Kept separate from the generator script so the
 * parsing rules are unit tested.
 */

import type { Card, CardEffect, CardType, Cost, CostOption, Payable } from './types'

const GOOD_ALIASES: Record<string, Payable> = {
  wood: 'wood',
  clay: 'clay',
  reed: 'reed',
  stone: 'stone',
  grain: 'grain',
  vegetable: 'vegetable',
  vegetables: 'vegetable',
  food: 'food',
  sheep: 'sheep',
  boar: 'boar',
  'wild boar': 'boar',
  cattle: 'cattle',
}

export function normaliseGood(word: string): Payable | null {
  return GOOD_ALIASES[word.trim().toLowerCase()] ?? null
}

/**
 * Parse a cost string such as "2 Wood/2 Clay,1 Reed".
 *
 * Comma separates terms that must all be paid; a slash inside a term offers a
 * choice. The result is the expanded list of payable alternatives. Costs that
 * reference game actions rather than goods (for example "Return Fireplace or
 * 4 Clay") keep only the goods alternatives they contain.
 */
export function parseCost(raw: string): Cost {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const terms = trimmed.split(',').map((term) => term.trim()).filter(Boolean)
  let options: CostOption[] = [{}]

  for (const term of terms) {
    // "Return Fireplace or 4 Clay" — keep the payable half.
    const alternatives = term
      .split('/')
      .flatMap((part) => part.split(/\bor\b/i))
      .map((part) => part.trim())
      .filter(Boolean)

    const parsed = alternatives
      .map(parseGoodAmount)
      .filter((entry): entry is { good: Payable; amount: number } => entry !== null)

    // A term we cannot read (e.g. "Return Fireplace") is skipped rather than
    // guessed at, so the card stays playable at its readable cost.
    if (parsed.length === 0) continue

    options = options.flatMap((option) =>
      parsed.map((entry) => ({
        ...option,
        [entry.good]: (option[entry.good] ?? 0) + entry.amount,
      })),
    )
  }

  // Drop duplicates produced by expansion.
  const seen = new Set<string>()
  return options.filter((option) => {
    const key = JSON.stringify(Object.entries(option).sort())
    if (seen.has(key) || key === '[]') return false
    seen.add(key)
    return true
  })
}

function parseGoodAmount(text: string): { good: Payable; amount: number } | null {
  const match = text.match(/(\d+)\s+([A-Za-z ]+)/)
  if (!match) return null
  const good = normaliseGood(match[2])
  if (!good) return null
  return { good, amount: Number(match[1]) }
}

/** "3+" -> 3; blank -> 1. */
export function parseMinPlayers(raw: string): number {
  const match = raw.trim().match(/^(\d+)\+?$/)
  return match ? Number(match[1]) : 1
}

/** Printed victory points; blank means the card prints none. */
export function parsePoints(raw: string | number): number {
  const value = Number(String(raw).trim())
  return Number.isFinite(value) ? value : 0
}

export function parseCardType(raw: string): CardType | null {
  const value = raw.toLowerCase()
  // Cards typed as belonging to two decks are filed under the primary one.
  if (value.startsWith('occupation')) return 'occupation'
  if (value.startsWith('major improvement')) return 'major'
  if (value.includes('minor')) return 'minor'
  if (value.includes('major')) return 'major'
  return null
}

/** Slugify a title into a stable id, disambiguated by type and index. */
export function makeCardId(title: string, type: CardType, seen: Map<string, number>): string {
  const base = `${type}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

/**
 * Map card text onto machine-readable effects where the phrasing is
 * unambiguous. Anything not matched here is left to the players, and the card
 * is marked unenforced so the UI can say so.
 */
export function parseEffects(text: string): CardEffect[] {
  const effects: CardEffect[] = []
  const clean = text.replace(/\s+/g, ' ').trim()

  // "When you play this card, take 1 Grain." / "you immediately get 2 Wood"
  const immediate = clean.match(
    /(?:when you play this card,?\s*(?:you\s*)?(?:immediately\s*)?(?:take|get|receive)|you immediately (?:get|receive|take))\s+([^.]+)/i,
  )
  if (immediate) {
    const goods = collectGoods(immediate[1])
    if (Object.keys(goods).length > 0) effects.push({ kind: 'gain', goods })
  }

  // "Whenever you use the "Day Laborer" Action space, you receive 3 additional Clay."
  const onAction = clean.match(
    /(?:whenever|each time) you use the ["“]?([A-Za-z' -]+?)["”]?\s+action space,?\s*you (?:receive|get|take)\s+([^.]+)/i,
  )
  if (onAction) {
    const goods = collectGoods(onAction[2])
    const spaceId = actionSpaceId(onAction[1])
    if (spaceId && Object.keys(goods).length > 0) {
      effects.push({ kind: 'onAction', spaceId, goods })
    }
  }

  // Tiered bonuses ("1/3/5 points for 5/6/7 …") are deliberately left to the
  // players — only flat and simple per-unit bonuses are enforced here.
  const tiered = /\d\s*\/\s*\d/.test(clean)

  // "At the end of the game, you receive 1 Bonus point for each room in your Stone house."
  if (!tiered) {
    const perUnit = clean.match(
      /(?:at the end of the game|during scoring),?\s*you (?:receive|get)\s+(\d+)\s+bonus points?\s+for each\s+([A-Za-z ]+)/i,
    )
    if (perUnit) {
      const per = scoringUnit(perUnit[2])
      if (per) effects.push({ kind: 'pointsPer', per, points: Number(perUnit[1]), each: 1 })
    }

    // "At the end of the game, you receive 2 Bonus points." — a flat award.
    const flat = clean.match(
      /(?:at the end of the game|during scoring),?\s*you (?:receive|get)\s+(\d+)\s+bonus points?\s*\./i,
    )
    if (flat) effects.push({ kind: 'points', points: Number(flat[1]) })
  }

  return effects
}

/** Map a scored noun onto something the engine can count. */
function scoringUnit(phrase: string): Extract<CardEffect, { kind: 'pointsPer' }>['per'] | null {
  const key = phrase.trim().toLowerCase()
  if (/^rooms?\b/.test(key)) return 'room'
  if (/^fields?\b/.test(key)) return 'field'
  if (/^pastures?\b/.test(key)) return 'pasture'
  if (/^grain\b/.test(key)) return 'grain'
  if (/^vegetables?\b/.test(key)) return 'vegetable'
  if (/^sheep\b/.test(key)) return 'sheep'
  if (/^(wild )?boar\b/.test(key)) return 'boar'
  if (/^cattle\b/.test(key)) return 'cattle'
  return null
}

/** Collect every "<n> <good>" pair in a phrase. */
function collectGoods(phrase: string): CostOption {
  const goods: CostOption = {}
  for (const match of phrase.matchAll(/(\d+)\s+(?:additional\s+)?([A-Za-z]+)/g)) {
    const good = normaliseGood(match[2])
    if (good) goods[good] = (goods[good] ?? 0) + Number(match[1])
  }
  return goods
}

/** Map a printed action-space name onto the engine's space ids. */
function actionSpaceId(name: string): string | null {
  const key = name.trim().toLowerCase()
  const map: Record<string, string> = {
    'day laborer': 'day-laborer',
    forest: 'forest',
    'clay pit': 'clay-pit',
    'reed bank': 'reed-bank',
    fishing: 'fishing',
    'grain seeds': 'grain-seeds',
    farmland: 'farmland',
    'farm expansion': 'farm-expansion',
    'meeting place': 'meeting-place',
    'sheep market': 'sheep-market',
    'pig market': 'pig-market',
    'cattle market': 'cattle-market',
    'vegetable seeds': 'vegetable-seeds',
  }
  return map[key] ?? null
}

export type RawCard = {
  base_expansion: string
  card_title: string
  category: string
  cost: string
  players: string
  text: string
  type: string
  vps: string | number
}

/** Convert one raw database record into a typed Card. */
export function toCard(raw: RawCard, seen: Map<string, number>): Card | null {
  const type = parseCardType(raw.type)
  if (!type) return null

  const effects = parseEffects(raw.text ?? '')
  return {
    id: makeCardId(raw.card_title, type, seen),
    title: raw.card_title,
    type,
    cost: parseCost(raw.cost ?? ''),
    points: parsePoints(raw.vps),
    text: (raw.text ?? '').replace(/\s+/g, ' ').trim(),
    minPlayers: parseMinPlayers(raw.players ?? ''),
    enforced: effects.length > 0,
    effects,
  }
}
