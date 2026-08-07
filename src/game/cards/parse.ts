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

  // Tiered wording ("1/3/6/9 rounds … 1/2/3/4 Wood") needs judgement the
  // engine does not have, and reading it as a flat amount overpays badly.
  const tiered = /\d\s*\/\s*\d/.test(clean)

  // "When you play this card, take 1 Grain." / "you immediately get 2 Wood"
  const immediate = tiered
    ? null
    : clean.match(
        /(?:when you play this card,?\s*(?:you\s*)?(?:immediately\s*)?(?:take|get|receive)|you immediately (?:get|receive|take))\s+([^.]+)/i,
      )
  if (immediate) {
    // A gain the player chooses between ("either 1 Stone or 1 Reed") or that
    // scales with the game state ("For each Round that has not yet begun…")
    // is not a fixed payout. Test the whole card, since the scaling clause can
    // sit before the phrase that matched.
    const conditional = /\beither\b|\bfor each\b|\bper\b/i.test(clean)
    const goods = conditional ? {} : collectGoods(immediate[1])
    if (Object.keys(goods).length > 0) effects.push({ kind: 'gain', goods })
  }

  // "Whenever you use the "Day Laborer" Action space, you receive 3 additional Clay."
  const onAction = clean.match(
    /(?:whenever|each time) you use the ["“]?([A-Za-z' -]+?)["”]?\s+action space,?\s*you (?:receive|get|take)\s+([^.]+)/i,
  )
  if (onAction) {
    // "1 Food or 1 Reed" is a choice; "From Round 8, 2 additional Food" changes
    // mid-game. Neither is a fixed bonus the engine can just hand over.
    const choice = /\bor\b|\bfrom round\b|\binstead\b/i.test(clean)
    const goods = choice ? {} : collectGoods(onAction[2])
    const spaceId = actionSpaceId(onAction[1])
    if (spaceId && Object.keys(goods).length > 0) {
      effects.push({ kind: 'onAction', spaceId, goods })
    }
  }

  // "At the end of the game, you receive 1 Bonus point for each room in your Stone house."
  if (!tiered) {
    const perUnit = clean.match(
      /(?:at the end of the game|during scoring),?\s*you (?:receive|get)\s+(\d+)\s+bonus points?\s+for each\s+([A-Za-z ]+)/i,
    )
    if (perUnit) {
      // "…on this card", "…except the 1st, 4th", "…that you play after this
      // one" all count something the engine does not track.
      const stateful = /on this card|except|after this one|at least|but could/i.test(clean)
      const per = stateful ? null : scoringUnit(perUnit[2])
      if (per) effects.push({ kind: 'pointsPer', per, points: Number(perUnit[1]), each: 1 })
    }

    // "At the end of the game, you receive 2 Bonus points." — a flat award.
    const conditionalFlat = /if |place \d|on this card|still on the card/i.test(clean)
    const flat = conditionalFlat
      ? null
      : clean.match(
          /(?:at the end of the game|during scoring),?\s*you (?:receive|get)\s+(\d+)\s+bonus points?\s*\./i,
        )
    if (flat) effects.push({ kind: 'points', points: Number(flat[1]) })
  }

  const drip = parseRoundDrip(clean)
  if (drip) effects.push(drip)

  const convert = parseConvert(clean)
  if (convert) effects.push(convert)

  const discount = parseDiscount(clean)
  if (discount) effects.push(discount)

  return effects
}

/** Rounds still to come after `from`, up to the end of the game. */
const LAST_ROUND = 14

/**
 * "Place 1 Food on each of the next 3 Round spaces."
 * "Place 2 Food on each remaining even-numbered Round space."
 * "Place 1 Clay on each of the spaces for rounds 6 to 14."
 *
 * Parsed relative to round 1, since cards are almost always played early and
 * the engine clamps to rounds that have not happened yet when the card is
 * actually played.
 */
export function parseRoundDrip(text: string): Extract<CardEffect, { kind: 'roundDrip' }> | null {
  // Conditional drips ("Once you live in a Clay hut, place …") only start when
  // the condition is met, which the engine cannot yet track. Leave them manual
  // rather than paying out immediately and overpaying the player.
  if (/^\s*(once|when|whenever|if|after)\b/i.test(text)) return null

  const head = text.match(/place (\d+) ([A-Za-z]+) on each/i)
  if (!head) return null

  const good = normaliseGood(head[2])
  if (!good) return null
  const amount = Number(head[1])

  const explicitRange = text.match(/rounds? (\d+)\s*(?:to|-|–)\s*(\d+)/i)
  if (explicitRange) {
    const start = Number(explicitRange[1])
    const end = Math.min(Number(explicitRange[2]), LAST_ROUND)
    return { kind: 'roundDrip', good, amount, rounds: range(start, end) }
  }

  const nextN = text.match(/next (\d+) round/i)
  if (nextN) {
    const count = Number(nextN[1])
    return { kind: 'roundDrip', good, amount, rounds: range(1, count) }
  }

  if (/even-numbered round/i.test(text)) {
    return {
      kind: 'roundDrip',
      good,
      amount,
      rounds: range(1, LAST_ROUND).filter((round) => round % 2 === 0),
    }
  }

  if (/odd-numbered round/i.test(text)) {
    return {
      kind: 'roundDrip',
      good,
      amount,
      rounds: range(1, LAST_ROUND).filter((round) => round % 2 === 1),
    }
  }

  if (/each remaining round space/i.test(text)) {
    return { kind: 'roundDrip', good, amount, rounds: range(1, LAST_ROUND) }
  }

  return null
}

function range(start: number, end: number): number[] {
  const result: number[] = []
  for (let value = start; value <= end; value++) result.push(value)
  return result
}

/**
 * "you may convert up to 1 Reed to 3 Food" / "convert 1 Grain into 5 Food".
 * Only single-source conversions with a fixed rate are enforced; the
 * multi-line rate tables on Cooking Hearth and friends are left manual.
 */
export function parseConvert(text: string): Extract<CardEffect, { kind: 'convert' }> | null {
  // A rate table lists several goods; those need a richer model than this.
  // The arrow form ("At most 1 time Grain -> 5 Food") is a single rate even
  // when other numbers appear, so it is checked before the table heuristic.
  const arrowForm = /(?:→|->)/.test(text)
  const tableLike = !arrowForm && (text.match(/\b\d+ Food\b/gi) ?? []).length > 1
  if (tableLike) return null

  // Tiered scoring text alongside a conversion ("1/2/3 Bonus points for
  // 2/4/5 Wood") means the card does more than the engine would apply.
  if (/\d\s*\/\s*\d/.test(text)) return null

  // Prose form: "convert up to 2 Grain into 5 Food each".
  const prose = text.match(/convert (?:up to )?(\d+) ([A-Za-z]+) (?:in)?to (\d+) food(\s+each)?/i)
  if (prose) {
    const from = normaliseGood(prose[2])
    if (!from || from === 'food') return null

    const count = Number(prose[1])
    const food = Number(prose[3])
    if (count <= 0) return null

    // "up to 2 Grain into 5 Food each" pays 5 per grain, not 5 in total.
    const rate = prose[4] ? food : food / count
    return { kind: 'convert', from, to: 'food', rate, limit: count }
  }

  // Arrow form used by the ovens: "At most 1 time Grain → 5 Food".
  const arrow = text.match(
    /(?:at most|up to) (\d+) times?\s+([A-Za-z]+)\s*(?:→|->)\s*(\d+) food/i,
  )
  if (arrow) {
    const from = normaliseGood(arrow[2])
    if (!from || from === 'food') return null

    // "N times" is how many separate exchanges are allowed, each at the
    // printed rate — not a total to divide.
    return {
      kind: 'convert',
      from,
      to: 'food',
      rate: Number(arrow[3]),
      limit: Number(arrow[1]),
    }
  }

  return null
}

/**
 * "All Improvements, Rooms and Renovations cost 1 Stone less."
 * "Every improvement, room, and renovation costs you 1 stone less."
 */
export function parseDiscount(text: string): Extract<CardEffect, { kind: 'discount' }> | null {
  const match = text.match(/costs? (?:you )?(\d+) ([A-Za-z]+) less/i)
  if (!match) return null

  const good = normaliseGood(match[2])
  if (!good) return null

  const mentionsRoom = /room|extension|extend/i.test(text)
  const mentionsRenovation = /renovat/i.test(text)
  const applies =
    mentionsRoom && mentionsRenovation ? 'both' : mentionsRenovation ? 'renovation' : 'room'

  return { kind: 'discount', good, amount: Number(match[1]), applies }
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
  if (/^(people|person|family member)/.test(key)) return 'person'
  if (/^improvements?\b/.test(key)) return 'improvement'
  if (/^occupations?\b/.test(key)) return 'occupation'
  if (/^wood\b/.test(key)) return 'wood'
  if (/^clay\b/.test(key)) return 'clay'
  if (/^reed\b/.test(key)) return 'reed'
  if (/^stone\b/.test(key)) return 'stone'
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
