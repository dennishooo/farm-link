/**
 * Rulebook constants for the Agricola Revised Edition base game.
 * Values transcribed from the official RE rule book and appendix
 * (see docs/rulebook/). Card-driven effects are out of scope for the
 * base-game build and are not represented here.
 */

import type { ActionSpace, HouseType } from './types'

export const MAX_ROUNDS = 14
export const MAX_PEOPLE = 5
export const MAX_STABLES = 4
export const MAX_FENCES = 15

/** Harvest happens at the end of these rounds. */
export const HARVEST_ROUNDS = [4, 7, 9, 11, 13, 14]

/** Food required per person during the feeding phase. */
export const FOOD_PER_PERSON = 2
export const FOOD_PER_NEWBORN = 1
/** The solo game is harsher: adults eat 3 food. */
export const FOOD_PER_PERSON_SOLO = 3

export const BEGGING_PENALTY = -3

/** A sown field starts with this many crops in the ground. */
export const SOWN_FIELD_YIELD: Record<'grain' | 'vegetable', number> = {
  grain: 3,
  vegetable: 2,
}

/** Room cost depends on the house you already live in; reed is constant. */
export const ROOM_COST: Record<HouseType, { resource: 'wood' | 'clay' | 'stone'; amount: number; reed: number }> = {
  wood: { resource: 'wood', amount: 5, reed: 2 },
  clay: { resource: 'clay', amount: 5, reed: 2 },
  stone: { resource: 'stone', amount: 5, reed: 2 },
}

/** Renovation: 1 reed for the roof plus 1 material per existing room. */
export const RENOVATION_TARGET: Record<'wood' | 'clay', HouseType> = {
  wood: 'clay',
  clay: 'stone',
}

export const STABLE_COST_WOOD = 2
export const FENCE_COST_WOOD = 1

/** Animals per pasture space, doubled by each stable inside the pasture. */
export const ANIMALS_PER_PASTURE_SPACE = 2
/** An unfenced stable holds exactly one animal. */
export const UNFENCED_STABLE_CAPACITY = 1
/** You may keep one animal of any type in your house as a pet. */
export const PET_CAPACITY = 1

/**
 * Occupation costs by player count, indexed by how many occupations the player
 * has already played on that space. The base "Lessons" space is free first.
 */
export const OCCUPATION_COST = {
  base: (played: number) => (played === 0 ? 0 : 1),
  extra: (playerCount: number, playedOnSpace: number) => {
    if (playerCount === 3) return 2
    if (playerCount === 4) return playedOnSpace < 2 ? 1 : 2
    return 1
  },
}

/**
 * Scoring thresholds, expressed as the minimum quantity needed for each score
 * from -1 upward. Transcribed from the appendix, "The Scoring in Detail".
 */
type ScoreTable = { min: number; points: number }[]

/** 0-1 fields = -1, 2 = 1, 3 = 2, 4 = 3, 5+ = 4. */
export const FIELD_SCORE: ScoreTable = [
  { min: 5, points: 4 },
  { min: 4, points: 3 },
  { min: 3, points: 2 },
  { min: 2, points: 1 },
  { min: 0, points: -1 },
]

/** No pastures = -1, otherwise 1 point each up to a maximum of 4. */
export const PASTURE_SCORE: ScoreTable = [
  { min: 4, points: 4 },
  { min: 3, points: 3 },
  { min: 2, points: 2 },
  { min: 1, points: 1 },
  { min: 0, points: -1 },
]

/** 0 grain = -1, 1-3 = 1, 4-5 = 2, 6-7 = 3, 8+ = 4. */
export const GRAIN_SCORE: ScoreTable = [
  { min: 8, points: 4 },
  { min: 6, points: 3 },
  { min: 4, points: 2 },
  { min: 1, points: 1 },
  { min: 0, points: -1 },
]

/** 0 vegetables = -1, otherwise 1 point each up to a maximum of 4. */
export const VEGETABLE_SCORE: ScoreTable = [
  { min: 4, points: 4 },
  { min: 3, points: 3 },
  { min: 2, points: 2 },
  { min: 1, points: 1 },
  { min: 0, points: -1 },
]

/** 0 sheep = -1, 1-3 = 1, 4-5 = 2, 6-7 = 3, 8+ = 4. */
export const SHEEP_SCORE: ScoreTable = [
  { min: 8, points: 4 },
  { min: 6, points: 3 },
  { min: 4, points: 2 },
  { min: 1, points: 1 },
  { min: 0, points: -1 },
]

/** 0 boar = -1, 1-2 = 1, 3-4 = 2, 5-6 = 3, 7+ = 4. */
export const BOAR_SCORE: ScoreTable = [
  { min: 7, points: 4 },
  { min: 5, points: 3 },
  { min: 3, points: 2 },
  { min: 1, points: 1 },
  { min: 0, points: -1 },
]

/** 0 cattle = -1, 1 = 1, 2-3 = 2, 4-5 = 3, 6+ = 4. */
export const CATTLE_SCORE: ScoreTable = [
  { min: 6, points: 4 },
  { min: 4, points: 3 },
  { min: 2, points: 2 },
  { min: 1, points: 1 },
  { min: 0, points: -1 },
]

export const POINTS_PER_PERSON = 3
export const POINTS_PER_CLAY_ROOM = 1
export const POINTS_PER_STONE_ROOM = 2
export const POINTS_PER_FENCED_STABLE = 1
export const MAX_FENCED_STABLE_POINTS = 4

/** Look up a score from a descending threshold table. */
export function scoreFromTable(table: ScoreTable, quantity: number): number {
  for (const { min, points } of table) {
    if (quantity >= min) return points
  }
  return table[table.length - 1].points
}

/**
 * The action spaces available from setup. These never leave the board.
 * "Traveling Players" is 4-player only; the second Lessons space needs 3+.
 */
export const BASE_ACTION_SPACES: ActionSpace[] = [
  {
    id: 'forest',
    name: 'Forest',
    stage: 0,
    accumulates: { good: 'wood', amount: 3 },
    description: 'Take all accumulated wood.',
  },
  {
    id: 'clay-pit',
    name: 'Clay Pit',
    stage: 0,
    accumulates: { good: 'clay', amount: 1 },
    description: 'Take all accumulated clay.',
  },
  {
    id: 'reed-bank',
    name: 'Reed Bank',
    stage: 0,
    accumulates: { good: 'reed', amount: 1 },
    description: 'Take all accumulated reed.',
  },
  {
    id: 'fishing',
    name: 'Fishing',
    stage: 0,
    accumulates: { good: 'food', amount: 1 },
    description: 'Take all accumulated food.',
  },
  {
    id: 'grain-seeds',
    name: 'Grain Seeds',
    stage: 0,
    description: 'Take 1 grain from the general supply.',
  },
  {
    id: 'farmland',
    name: 'Farmland',
    stage: 0,
    description: 'Plow 1 field.',
  },
  {
    id: 'farm-expansion',
    name: 'Farm Expansion',
    stage: 0,
    description: 'Build rooms and/or build stables.',
  },
  {
    id: 'meeting-place',
    name: 'Meeting Place',
    stage: 0,
    description: 'Become the start player.',
  },
  {
    id: 'day-laborer',
    name: 'Day Laborer',
    stage: 0,
    description: 'Take 2 food.',
  },
  {
    id: 'lessons',
    name: 'Lessons',
    stage: 0,
    description: 'Play 1 occupation.',
  },
  {
    id: 'lessons-2',
    name: 'Lessons (second space)',
    stage: 0,
    minPlayers: 3,
    description: 'Play 1 occupation, paying the occupation cost.',
  },
  {
    id: 'traveling-players',
    name: 'Traveling Players',
    stage: 0,
    minPlayers: 4,
    accumulates: { good: 'food', amount: 1 },
    description: 'Take all accumulated food.',
  },
]

/**
 * Stage cards enter play one per round in a randomised order within each
 * stage. Stage boundaries follow the RE board: stage 1 covers rounds 1-4,
 * stage 2 rounds 5-7, stage 3 rounds 8-9, stage 4 rounds 10-11,
 * stage 5 rounds 12-13, stage 6 round 14.
 */
export const STAGE_ROUNDS: number[][] = [
  [1, 2, 3, 4],
  [5, 6, 7],
  [8, 9],
  [10, 11],
  [12, 13],
  [14],
]

export const STAGE_ACTION_SPACES: ActionSpace[] = [
  // Stage 1 — four cards for rounds 1-4.
  {
    id: 'sheep-market',
    name: 'Sheep Market',
    stage: 1,
    accumulates: { good: 'sheep', amount: 1 },
    description: 'Take all accumulated sheep.',
  },
  {
    id: 'fences',
    name: 'Fencing',
    stage: 1,
    description: 'Build fences, 1 wood each.',
  },
  {
    id: 'grain-utilization',
    name: 'Grain Utilization',
    stage: 1,
    description: 'Sow and/or bake bread.',
  },
  {
    id: 'major-improvement',
    name: 'Major Improvement',
    stage: 1,
    description: 'Build 1 major or minor improvement.',
  },

  // Stage 2 — three cards for rounds 5-7.
  {
    id: 'sow-and-bake',
    name: 'Cultivation',
    stage: 2,
    description: 'Plow 1 field and/or sow.',
  },
  {
    id: 'wish-for-children',
    name: 'Basic Wish for Children',
    stage: 2,
    description: 'Family growth (only with room available).',
  },
  {
    id: 'house-redevelopment',
    name: 'House Redevelopment',
    stage: 2,
    description: 'Renovate your house, then optionally build an improvement.',
  },

  // Stage 3 — two cards for rounds 8-9.
  {
    id: 'pig-market',
    name: 'Pig Market',
    stage: 3,
    accumulates: { good: 'boar', amount: 1 },
    description: 'Take all accumulated wild boar.',
  },
  {
    id: 'vegetable-seeds',
    name: 'Vegetable Seeds',
    stage: 3,
    description: 'Take 1 vegetable from the general supply.',
  },

  // Stage 4 — two cards for rounds 10-11.
  {
    id: 'cattle-market',
    name: 'Cattle Market',
    stage: 4,
    accumulates: { good: 'cattle', amount: 1 },
    description: 'Take all accumulated cattle.',
  },
  {
    id: 'east-quarry',
    name: 'Eastern Quarry',
    stage: 4,
    accumulates: { good: 'stone', amount: 1 },
    description: 'Take all accumulated stone.',
  },

  // Stage 5 — two cards for rounds 12-13.
  {
    id: 'west-quarry',
    name: 'Western Quarry',
    stage: 5,
    accumulates: { good: 'stone', amount: 1 },
    description: 'Take all accumulated stone.',
  },
  {
    id: 'urgent-wish-for-children',
    name: 'Urgent Wish for Children',
    stage: 5,
    description: 'Family growth even without room.',
  },

  // Stage 6 — final round.
  {
    id: 'farm-redevelopment',
    name: 'Farm Redevelopment',
    stage: 6,
    description: 'Renovate your house, then optionally build fences.',
  },
]
