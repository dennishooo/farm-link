/**
 * Core domain types for the Agricola Revised Edition base game.
 *
 * Geometry note: the farmyard is 3 rows x 5 columns (15 spaces). Spaces are
 * indexed row-major, 0..14. Fences live on the *edges between* spaces rather
 * than on spaces themselves, which is what makes real pasture scoring possible.
 */

export type BuildingResource = 'wood' | 'clay' | 'reed' | 'stone'
export type Crop = 'grain' | 'vegetable'
export type AnimalType = 'sheep' | 'boar' | 'cattle'
export type Good = BuildingResource | Crop | AnimalType | 'food'

export type HouseType = 'wood' | 'clay' | 'stone'

/** A farmyard space holds at most one structure. */
export type SpaceKind = 'empty' | 'room' | 'field' | 'stable'

export type FarmSpace = {
  kind: SpaceKind
  /** Crop planted on a field, with the remaining count still in the ground. */
  crop?: Crop
  cropCount?: number
}

/**
 * Fence edges. A 3x5 grid has 4 horizontal fence rows (20 slots) and
 * 3 vertical fence rows of 6 slots (18 slots). We track them as sets of
 * edge keys so adjacency and enclosure can be computed properly.
 */
export type FenceEdge = string

export type Player = {
  id: string
  name: string
  color: PlayerColor

  /** Goods in personal supply. */
  wood: number
  clay: number
  reed: number
  stone: number
  grain: number
  vegetable: number
  food: number
  sheep: number
  boar: number
  cattle: number

  house: HouseType
  /** People in play (max 5). */
  people: number
  /** People placed as workers this round. */
  peoplePlaced: number
  /**
   * People born this round. Newborns cannot act until next round and only
   * require 1 food during the feeding phase.
   */
  newborns: number
  beggingMarkers: number

  farm: FarmSpace[]
  fences: FenceEdge[]
  /** Remaining supply limits, per the rulebook: 15 fences, 4 stables, 5 people. */
  fencesRemaining: number
  stablesRemaining: number

  /** Animals assigned to a specific pasture/stable, keyed by pasture id. */
  animalPlacement: AnimalPlacement[]

  /** Card ids still in hand, by deck. */
  hand: { occupations: string[]; minors: string[] }
  /** Card ids played face up in front of this player. */
  played: string[]
  /**
   * Goods a played card placed on future round spaces, collected at the start
   * of the matching round.
   */
  roundGoods: { round: number; good: string; amount: number }[]
}

export type AnimalPlacement = {
  /** Sorted, comma-joined space indices identifying the enclosure. */
  key: string
  type: AnimalType
  count: number
}

export type PlayerColor = 'green' | 'blue' | 'red' | 'purple'

/** An action space on the shared board. */
export type ActionSpaceId = string

export type ActionSpace = {
  id: ActionSpaceId
  name: string
  /** Round this space enters play; 0 means available from setup. */
  stage: number
  /** Accumulating spaces gain goods at the start of every round. */
  accumulates?: { good: Good; amount: number }
  /** Minimum player count for this space to be in the game. */
  minPlayers?: number
  description: string
}

export type GamePhase = 'setup' | 'work' | 'harvest' | 'finished'

export type HarvestStage = 'field' | 'feeding' | 'breeding'

export type GameState = {
  version: number
  phase: GamePhase
  round: number
  maxRounds: number
  players: Player[]
  currentPlayerIndex: number
  startPlayerIndex: number
  /** Player who claimed the start player token this round, if any. */
  pendingStartPlayer: number | null
  /** Goods sitting on accumulation spaces, keyed by action space id. */
  accumulated: Record<ActionSpaceId, number>
  /** Which player occupies each action space this round. */
  occupied: Record<ActionSpaceId, string>
  /** Action spaces revealed so far, in reveal order. */
  revealed: ActionSpaceId[]
  /** Major improvement card ids still available to build. */
  majorsAvailable: string[]
  log: LogEntry[]
  harvest: { stage: HarvestStage; playerIndex: number } | null
}

/**
 * Log entries store a translation key and its values rather than a finished
 * sentence, so switching language re-renders the whole history correctly.
 */
export type LogEntry = {
  round: number
  key: string
  values?: Record<string, string | number>
}

export type ScoreBreakdown = {
  fields: number
  pastures: number
  grain: number
  vegetables: number
  sheep: number
  boar: number
  cattle: number
  unusedSpaces: number
  fencedStables: number
  clayRooms: number
  stoneRooms: number
  people: number
  beggingMarkers: number
  cards: number
  total: number
}
