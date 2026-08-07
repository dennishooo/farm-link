/**
 * Game state: setup, round progression, and the three harvest phases.
 *
 * These belong together because they form a cycle — ending the work phase runs
 * the harvest, and completing the harvest begins the next round. Splitting them
 * further would only turn that cycle into a circular import.
 *
 * Everything here mutates a draft state in place; the store clones before
 * calling so React still sees a new reference.
 */

import { SPACE_COUNT } from './geometry'
import { houseAnimals, syncAnimalTotals } from './farm'
import { dealCards } from './cards'
import {
  BASE_ACTION_SPACES,
  FOOD_PER_NEWBORN,
  FOOD_PER_PERSON,
  FOOD_PER_PERSON_SOLO,
  HARVEST_ROUNDS,
  MAX_FENCES,
  MAX_ROUNDS,
  MAX_STABLES,
  STAGE_ACTION_SPACES,
  STAGE_ROUNDS,
} from './rules'
import type {
  ActionSpace,
  ActionSpaceId,
  AnimalType,
  FarmSpace,
  GameState,
  Player,
  PlayerColor,
} from './types'
import type { Payable } from './cards/types'

const COLORS: PlayerColor[] = ['green', 'blue', 'red', 'purple']

export const STATE_VERSION = 5

/** Deterministic shuffle so a seed reproduces the same stage-card order. */
export function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function makeFarm(): FarmSpace[] {
  const farm: FarmSpace[] = Array.from({ length: SPACE_COUNT }, () => ({ kind: 'empty' }))
  // Two starting wood rooms, bottom-left of the farmyard board.
  farm[5] = { kind: 'room' }
  farm[10] = { kind: 'room' }
  return farm
}

function makePlayer(name: string, index: number, hand: Player['hand']): Player {
  return {
    id: `p${index + 1}`,
    name,
    color: COLORS[index % COLORS.length],
    wood: 0,
    clay: 0,
    reed: 0,
    stone: 0,
    grain: 0,
    vegetable: 0,
    // The start player begins with 2 food, everyone else with 3.
    food: index === 0 ? 2 : 3,
    sheep: 0,
    boar: 0,
    cattle: 0,
    house: 'wood',
    people: 2,
    peoplePlaced: 0,
    newborns: 0,
    beggingMarkers: 0,
    farm: makeFarm(),
    fences: [],
    fencesRemaining: MAX_FENCES,
    stablesRemaining: MAX_STABLES,
    animalPlacement: [],
    hand,
    played: [],
    roundGoods: [],
  }
}

/** Action spaces in play for this player count, in stage-card reveal order. */
export function buildDeck(playerCount: number, random: () => number): ActionSpaceId[] {
  const order: ActionSpaceId[] = []
  for (let stage = 1; stage <= STAGE_ROUNDS.length; stage++) {
    const cards = STAGE_ACTION_SPACES.filter(
      (space) => space.stage === stage && (space.minPlayers ?? 1) <= playerCount,
    )
    for (const card of shuffle(cards, random)) order.push(card.id)
  }
  return order
}

export function allSpacesFor(playerCount: number): ActionSpace[] {
  return [...BASE_ACTION_SPACES, ...STAGE_ACTION_SPACES].filter(
    (space) => (space.minPlayers ?? 1) <= playerCount,
  )
}

export function findSpace(id: ActionSpaceId): ActionSpace | undefined {
  return [...BASE_ACTION_SPACES, ...STAGE_ACTION_SPACES].find((space) => space.id === id)
}

export type NewGameOptions = {
  names: string[]
  random?: () => number
}

export function createGame({ names, random = Math.random }: NewGameOptions): GameState {
  const playerCount = names.length
  const dealt = dealCards(playerCount, random)
  const players = names.map((name, index) => makePlayer(name, index, dealt.hands[index]))
  const deck = buildDeck(playerCount, random)

  const state: GameState = {
    version: STATE_VERSION,
    phase: 'work',
    round: 1,
    maxRounds: MAX_ROUNDS,
    players,
    currentPlayerIndex: 0,
    startPlayerIndex: 0,
    pendingStartPlayer: null,
    accumulated: {},
    occupied: {},
    revealed: [],
    majorsAvailable: dealt.majors,
    log: [],
    harvest: null,
  }

  // Stash the deck order on the state so later rounds reveal deterministically.
  deckOrder.set(state, deck)
  revealForRound(state, deck)
  replenish(state, playerCount)
  logMessage(state, 'gameStart', { name: players[0].name })
  return state
}

/**
 * Stage-card order per game. Kept outside the serialisable state and rebuilt
 * on load from the already-revealed list plus the remaining cards.
 */
const deckOrder = new WeakMap<GameState, ActionSpaceId[]>()

export function setDeckOrder(state: GameState, deck: ActionSpaceId[]): void {
  deckOrder.set(state, deck)
}

export function getDeckOrder(state: GameState): ActionSpaceId[] {
  const existing = deckOrder.get(state)
  if (existing) return existing

  // Rebuilt after a reload: keep what was revealed, append the rest in
  // canonical stage order so play can continue.
  const remaining = STAGE_ACTION_SPACES.filter(
    (space) =>
      !state.revealed.includes(space.id) && (space.minPlayers ?? 1) <= state.players.length,
  ).map((space) => space.id)
  const rebuilt = [...state.revealed, ...remaining]
  deckOrder.set(state, rebuilt)
  return rebuilt
}

function revealForRound(state: GameState, deck = getDeckOrder(state)): void {
  const next = deck[state.round - 1]
  if (next && !state.revealed.includes(next)) {
    state.revealed.push(next)
    const space = findSpace(next)
    if (space) logMessage(state, 'spaceRevealed', { space: space.id })
  }
}

/**
 * How much a space gains each round. Solo games get 2 wood on the Forest
 * instead of 3. Shared with the UI so the displayed rate always matches what
 * the engine actually pays out.
 */
export function accumulationRate(space: ActionSpace, playerCount: number): number {
  if (!space.accumulates) return 0
  if (space.id === 'forest' && playerCount === 1) return 2
  return space.accumulates.amount
}

/** Add this round's goods to every accumulating space that is in play. */
function replenish(state: GameState, playerCount = state.players.length): void {
  for (const space of allSpacesFor(playerCount)) {
    if (!space.accumulates) continue
    const inPlay = space.stage === 0 || state.revealed.includes(space.id)
    if (!inPlay) continue
    state.accumulated[space.id] =
      (state.accumulated[space.id] ?? 0) + accumulationRate(space, playerCount)
  }
}

/** Record a log entry by translation key so it can render in any language. */
export function logMessage(
  state: GameState,
  key: string,
  values?: Record<string, string | number>,
): void {
  state.log.push({ round: state.round, key, values })
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex]
}

export function workersLeft(player: Player): number {
  return Math.max(0, player.people - player.newborns - player.peoplePlaced)
}

export function isSpaceAvailable(state: GameState, id: ActionSpaceId): boolean {
  const space = findSpace(id)
  if (!space) return false
  if ((space.minPlayers ?? 1) > state.players.length) return false
  if (space.stage !== 0 && !state.revealed.includes(id)) return false
  return !state.occupied[id]
}

/** Advance to the next player with workers left, or end the work phase. */
export function advanceTurn(state: GameState): void {
  if (state.players.every((player) => workersLeft(player) === 0)) {
    endWorkPhase(state)
    return
  }

  const count = state.players.length
  for (let step = 1; step <= count; step++) {
    const index = (state.currentPlayerIndex + step) % count
    if (workersLeft(state.players[index]) > 0) {
      state.currentPlayerIndex = index
      return
    }
  }
}

function endWorkPhase(state: GameState): void {
  logMessage(state, 'workPhaseComplete', { round: state.round })

  if (HARVEST_ROUNDS.includes(state.round)) {
    state.phase = 'harvest'
    state.harvest = { stage: 'field', playerIndex: 0 }
    runFieldPhase(state)
    return
  }

  beginNextRound(state)
}

export function beginNextRound(state: GameState): void {
  if (state.round >= state.maxRounds) {
    state.phase = 'finished'
    state.harvest = null
    logMessage(state, 'gameOver')
    return
  }

  state.round += 1
  state.phase = 'work'
  state.harvest = null
  state.occupied = {}

  if (state.pendingStartPlayer !== null) {
    state.startPlayerIndex = state.pendingStartPlayer
    state.pendingStartPlayer = null
  }

  for (const player of state.players) {
    player.peoplePlaced = 0
    player.newborns = 0
  }

  state.currentPlayerIndex = state.startPlayerIndex
  revealForRound(state)
  replenish(state)
  collectRoundGoods(state)
  logMessage(state, 'roundBegins', { round: state.round })
}
/* ------------------------------------------------------------------ *
 * Harvest
 * ------------------------------------------------------------------ */

/** Field phase: take exactly 1 crop from every sown field. */
export function runFieldPhase(state: GameState): void {
  for (const player of state.players) {
    let harvested = 0
    for (const space of player.farm) {
      if (space.kind !== 'field' || !space.crop || !space.cropCount) continue
      space.cropCount -= 1
      player[space.crop] += 1
      harvested += 1
      if (space.cropCount === 0) {
        delete space.crop
        delete space.cropCount
      }
    }
    if (harvested > 0) {
      logMessage(state, 'harvestCrops', { name: player.name, count: harvested })
    }
  }
  state.harvest = { stage: 'feeding', playerIndex: 0 }
}

export function foodRequiredFor(state: GameState, player: Player): number {
  const perAdult = state.players.length === 1 ? FOOD_PER_PERSON_SOLO : FOOD_PER_PERSON
  const adults = player.people - player.newborns
  return adults * perAdult + player.newborns * FOOD_PER_NEWBORN
}

/**
 * Feeding phase. Grain and vegetables in supply are worth 1 food each, and are
 * consumed automatically only when the player cannot otherwise pay.
 */
export function feedFamily(state: GameState, playerIndex: number): void {
  const player = state.players[playerIndex]
  const required = foodRequiredFor(state, player)

  let paid = Math.min(player.food, required)
  player.food -= paid

  for (const crop of ['grain', 'vegetable'] as const) {
    while (paid < required && player[crop] > 0) {
      player[crop] -= 1
      paid += 1
    }
  }

  if (paid < required) {
    const missing = required - paid
    player.beggingMarkers += missing
    logMessage(state, 'beg', { name: player.name, count: missing })
  } else {
    logMessage(state, 'feed', { name: player.name, count: required })
  }
}

/**
 * Breeding phase: each animal type with 2+ animals produces exactly one
 * newborn, but only if the farm can accommodate it.
 *
 * Animal placements are the source of truth, so we count from there and let
 * houseAnimals report whether the newborn actually fits.
 */
export function breedAnimals(state: GameState, playerIndex: number): void {
  const player = state.players[playerIndex]
  const born: AnimalType[] = []
  const crowded: AnimalType[] = []

  syncAnimalTotals(player)
  for (const type of ['sheep', 'boar', 'cattle'] as const) {
    if (player[type] < 2) continue
    if (houseAnimals(player, type, 1) === 0) born.push(type)
    else crowded.push(type)
  }

  syncAnimalTotals(player)
  if (born.length > 0) {
    logMessage(state, 'breed', { name: player.name, types: born.join(', ') })
  }
  // A pair that cannot house its newborn simply does not breed (rulebook p.8).
  // Silence made that look like a bug, so say it happened and why.
  if (crowded.length > 0) {
    logMessage(state, 'breedNoRoom', { name: player.name, types: crowded.join(', ') })
  }
}

/** Run the feeding and breeding phases for every player, then move on. */
export function completeHarvest(state: GameState): void {
  for (let index = 0; index < state.players.length; index++) {
    feedFamily(state, index)
  }
  for (let index = 0; index < state.players.length; index++) {
    breedAnimals(state, index)
  }
  logMessage(state, 'harvestComplete')
  beginNextRound(state)
}

/**
 * Pay out any goods that played cards placed on this round's space. Animals
 * still have to fit on the farm; anything that does not is lost, as it would
 * be on the table.
 */
export function collectRoundGoods(state: GameState): void {
  for (const player of state.players) {
    const due = player.roundGoods.filter((entry) => entry.round === state.round)
    if (due.length === 0) continue
    player.roundGoods = player.roundGoods.filter((entry) => entry.round !== state.round)

    const gained: string[] = []
    for (const { good, amount } of due) {
      if (good === 'sheep' || good === 'boar' || good === 'cattle') {
        houseAnimals(player, good, amount)
        syncAnimalTotals(player)
      } else {
        player[good as Payable] += amount
      }
      gained.push(`${amount} ${good}`)
    }
    logMessage(state, 'roundGoods', { name: player.name, goods: gained.join(', ') })
  }
}
