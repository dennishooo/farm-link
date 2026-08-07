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

/** Things a scoring bonus can be counted against. */
export type Countable = Payable | 'field' | 'pasture' | 'room' | 'person' | 'improvement' | 'occupation'

/**
 * Effects the engine enforces mechanically. Cards whose text does not map onto
 * one of these are still dealt, played, and scored for printed points, but
 * their ongoing text is left to the players — `enforced` records which is which.
 */
export type CardEffect =
  /** Gain goods the moment the card is played. */
  | { kind: 'gain'; goods: CostOption }
  /** Ongoing bonus goods whenever a given action space is used. */
  | { kind: 'onAction'; spaceId: string; goods: CostOption }
  /** Flat victory points at scoring time. */
  | { kind: 'points'; points: number }
  /** Bonus points per unit of something the player owns at scoring. */
  | { kind: 'pointsPer'; per: Countable; points: number; each: number }
  /**
   * Goods placed on future round spaces, collected at the start of each of
   * those rounds. `rounds` lists the absolute round numbers.
   */
  | { kind: 'roundDrip'; good: Payable; amount: number; rounds: number[] }
  /**
   * An exchange the player may make at any time, or during feeding. Rates are
   * per single unit of `from`. `limit` caps uses per harvest when present.
   */
  | { kind: 'convert'; from: Payable; to: 'food'; rate: number; limit?: number }
  /**
   * Tiered bonus points: the highest threshold whose quantity the player
   * reaches is awarded. `tiers` is ordered ascending by `min`.
   */
  | { kind: 'pointsTiered'; per: Countable; tiers: { min: number; points: number }[] }
  /** A standing discount when building or renovating. */
  | { kind: 'discount'; good: Payable; amount: number; applies: 'room' | 'renovation' | 'both' }

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
