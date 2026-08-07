/**
 * Card operations: dealing, affordability, payment, and effect application.
 */

import { CARDS, MAJOR_IMPROVEMENTS, MINOR_IMPROVEMENTS, OCCUPATIONS } from './data'
import type { Card, CostOption, Payable } from './types'
import type { Player } from '../types'

export { CARDS, MAJOR_IMPROVEMENTS, MINOR_IMPROVEMENTS, OCCUPATIONS }
export type { Card, CardEffect } from './types'

/** Cards dealt to each player at setup, per the Revised Edition. */
export const OCCUPATIONS_PER_PLAYER = 7
export const MINORS_PER_PLAYER = 7

export function cardById(id: string): Card | undefined {
  return CARDS.find((card) => card.id === id)
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export type DealtHands = {
  hands: { occupations: string[]; minors: string[] }[]
  /** Major improvements are a shared pool, not dealt to hands. */
  majors: string[]
}

/**
 * Deal starting hands. Cards restricted to more players than are in the game
 * are excluded before dealing.
 */
export function dealCards(playerCount: number, random: () => number): DealtHands {
  const eligible = (cards: Card[]) => cards.filter((card) => card.minPlayers <= playerCount)

  const occupationPool = shuffled(eligible(OCCUPATIONS), random)
  const minorPool = shuffled(eligible(MINOR_IMPROVEMENTS), random)

  const hands = Array.from({ length: playerCount }, (_, index) => ({
    occupations: occupationPool
      .slice(index * OCCUPATIONS_PER_PLAYER, (index + 1) * OCCUPATIONS_PER_PLAYER)
      .map((card) => card.id),
    minors: minorPool
      .slice(index * MINORS_PER_PLAYER, (index + 1) * MINORS_PER_PLAYER)
      .map((card) => card.id),
  }))

  return { hands, majors: eligible(MAJOR_IMPROVEMENTS).map((card) => card.id) }
}

/** Can the player pay this specific set of goods? */
export function canPayOption(player: Player, option: CostOption): boolean {
  return Object.entries(option).every(
    ([good, amount]) => player[good as Payable] >= (amount ?? 0),
  )
}

/** The cost alternatives this player can currently afford. */
export function affordableOptions(player: Player, card: Card): CostOption[] {
  if (card.cost.length === 0) return [{}]
  return card.cost.filter((option) => canPayOption(player, option))
}

export function canAfford(player: Player, card: Card): boolean {
  return affordableOptions(player, card).length > 0
}

/** Deduct a cost option. The caller must have checked affordability. */
export function payOption(player: Player, option: CostOption): void {
  for (const [good, amount] of Object.entries(option)) {
    player[good as Payable] -= amount ?? 0
  }
}

/** Apply the immediate half of a card's effects when it is played. */
export function applyImmediateEffects(player: Player, card: Card): void {
  for (const effect of card.effects) {
    if (effect.kind !== 'gain') continue
    for (const [good, amount] of Object.entries(effect.goods)) {
      player[good as Payable] += amount ?? 0
    }
  }
}

/**
 * Bonus goods a played card grants when a given action space is used.
 * Returned rather than applied so the engine can log it.
 */
export function actionBonuses(cards: Card[], spaceId: string): CostOption {
  const total: CostOption = {}
  for (const card of cards) {
    for (const effect of card.effects) {
      if (effect.kind !== 'onAction' || effect.spaceId !== spaceId) continue
      for (const [good, amount] of Object.entries(effect.goods)) {
        total[good as Payable] = (total[good as Payable] ?? 0) + (amount ?? 0)
      }
    }
  }
  return total
}
