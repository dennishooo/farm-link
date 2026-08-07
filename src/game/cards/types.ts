/**
 * Card domain types.
 *
 * Card data is generated from the community card database (see
 * scripts/build-cards.ts) and checked in as `data.ts`, so the app ships with
 * the deck baked in and needs no network access at runtime.
 */

import type { BuildingResource, Crop, AnimalType } from '../types'

export type CardType = 'occupation' | 'minor' | 'major'

/** Goods that can appear in a card cost or payout. */
export type Payable = BuildingResource | Crop | AnimalType | 'food'

/** One concrete way to pay a cost: every entry must be paid. */
export type CostOption = Partial<Record<Payable, number>>

/**
 * A cost is a list of alternatives — pay any one of them. An empty list means
 * the card is free. Costs like "2 Wood/2 Clay, 1 Reed" become two options:
 * {wood:2, reed:1} or {clay:2, reed:1}.
 */
export type Cost = CostOption[]

/**
 * Effects the engine can enforce mechanically. Cards whose text does not map
 * onto one of these are still playable and still score, but their ongoing
 * text is left to the players to apply — `enforced` records which is which.
 */
export type CardEffect =
  /** Gain goods the moment the card is played. */
  | { kind: 'gain'; goods: CostOption }
  /** Ongoing bonus goods whenever an action space is used. */
  | { kind: 'onAction'; spaceId: string; goods: CostOption }
  /** Flat victory points at scoring time. */
  | { kind: 'points'; points: number }
  /** Bonus points per unit of something the player owns at scoring. */
  | { kind: 'pointsPer'; per: Payable | 'field' | 'pasture' | 'room'; points: number; each: number }

export type Card = {
  /** Stable slug derived from the title and type. */
  id: string
  title: string
  type: CardType
  /** Cost alternatives; empty means free to play. */
  cost: Cost
  /** Printed victory points; 0 when the card prints none. */
  points: number
  /** Rules text exactly as printed. */
  text: string
  /** Minimum player count, when the card is restricted. */
  minPlayers: number
  /** Whether the engine applies this card's effect automatically. */
  enforced: boolean
  /** Machine-readable effects, when the text could be mapped. */
  effects: CardEffect[]
}

export type Deck = {
  occupations: Card[]
  minors: Card[]
  majors: Card[]
}
