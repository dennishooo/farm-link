/**
 * Generate src/game/cards/data.ts from the community card database dump.
 *
 * Run with:  bun run cards:build
 *
 * The dump (scripts/cards-raw.json) comes from agricolacards.com, a fan-made
 * reference. We keep only the base-game decks and bake the result into the
 * bundle so the app never needs the network at runtime.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { toCard, type RawCard } from '../src/game/cards/parse'
import type { Card } from '../src/game/cards/types'

const INPUT = new URL('./cards-raw.json', import.meta.url)
const OUTPUT = new URL('../src/game/cards/data.ts', import.meta.url)

/**
 * The classic base-game deck, as the source database labels it. The Revised
 * Edition additions are excluded so the deck matches one printed set.
 */
const BASE_EDITION = 'Base'

/**
 * Clay Oven and Stone Oven are base-game major improvements, but this database
 * files them under the 5-6 player expansion. Bread baking needs them, so they
 * are pulled back into the base deck by name.
 */
const EXTRA_MAJORS = new Set(['Clay Oven', 'Stone Oven'])

function isBaseCard(entry: RawCard): boolean {
  if (entry.base_expansion === BASE_EDITION) return true
  return EXTRA_MAJORS.has(entry.card_title) && entry.type.includes('Major')
}

function main() {
  const raw: RawCard[] = JSON.parse(readFileSync(INPUT, 'utf-8'))
  const seen = new Map<string, number>()

  const cards = raw
    .filter(isBaseCard)
    .map((entry) => toCard(entry, seen))
    .filter((card): card is Card => card !== null)
    .map((card) =>
      // The ovens inherit "6+" from their 5-6 player listing, which would keep
      // them out of every normal game. They are base-game cards here.
      EXTRA_MAJORS.has(card.title) ? { ...card, minPlayers: 1 } : card,
    )

  const occupations = cards.filter((card) => card.type === 'occupation')
  const minors = cards.filter((card) => card.type === 'minor')
  const majors = cards.filter((card) => card.type === 'major')
  const enforced = cards.filter((card) => card.enforced).length

  const body = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun run cards:build
 *
 * Source: agricolacards.com community database, base-game decks only.
 * ${cards.length} cards — ${occupations.length} occupations, ${minors.length} minor
 * improvements, ${majors.length} major improvements. ${enforced} have effects the
 * engine applies automatically; the rest are dealt and scored, with their
 * ongoing text applied by the players.
 */

import type { Card } from './types'

export const CARDS: Card[] = ${JSON.stringify(cards, null, 2)}

export const OCCUPATIONS = CARDS.filter((card) => card.type === 'occupation')
export const MINOR_IMPROVEMENTS = CARDS.filter((card) => card.type === 'minor')
export const MAJOR_IMPROVEMENTS = CARDS.filter((card) => card.type === 'major')
`

  writeFileSync(OUTPUT, body)
  console.log(
    `Wrote ${cards.length} cards ` +
      `(${occupations.length} occupations, ${minors.length} minors, ${majors.length} majors); ` +
      `${enforced} enforced.`,
  )
}

main()
