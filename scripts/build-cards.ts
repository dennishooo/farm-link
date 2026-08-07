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

/** Editions that make up the base game as this project plays it. */
const BASE_EDITIONS = new Set(['Base', 'Base (Revised)'])

function main() {
  const raw: RawCard[] = JSON.parse(readFileSync(INPUT, 'utf-8'))
  const seen = new Map<string, number>()

  const cards = raw
    .filter((entry) => BASE_EDITIONS.has(entry.base_expansion))
    .map((entry) => toCard(entry, seen))
    .filter((card): card is Card => card !== null)

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
