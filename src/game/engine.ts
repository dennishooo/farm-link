/**
 * Game engine: setup, worker placement, the three harvest phases, and round
 * progression. All functions mutate a draft state and return a result telling
 * the caller whether the action was legal.
 */

import { edgesOfSpace, findPastures, pastureBoundaryEdges, SPACE_COUNT } from './geometry'
import {
  canPlace,
  countKind,
  houseAnimals,
  moveAnimals,
  pastureInfo,
  removeAnimals,
  syncAnimalTotals,
} from './farm'
import {
  actionBonuses,
  affordableOptions,
  applyImmediateEffects,
  cardById,
  dealCards,
  discountFor,
  payOption,
  scheduledDrips,
} from './cards'
import {
  BASE_ACTION_SPACES,
  FENCE_COST_WOOD,
  FOOD_PER_NEWBORN,
  FOOD_PER_PERSON,
  FOOD_PER_PERSON_SOLO,
  HARVEST_ROUNDS,
  MAX_FENCES,
  MAX_PEOPLE,
  MAX_ROUNDS,
  MAX_STABLES,
  RENOVATION_TARGET,
  ROOM_COST,
  SOWN_FIELD_YIELD,
  STABLE_COST_WOOD,
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

/**
 * Failures carry a translation key under `errors.*` plus its values, so the UI
 * renders them in the player's language rather than a baked-in English string.
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; reason: string; values?: Record<string, string | number> }

const ok: ActionResult = { ok: true }
const fail = (reason: string, values?: Record<string, string | number>): ActionResult => ({
  ok: false,
  reason,
  values,
})

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

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

export type ActionPayload = {
  /** Space index for plow/build actions. */
  spaceIndex?: number
  /** Space indices for building multiple rooms or stables in one action. */
  spaceIndices?: number[]
  /** Fence edges to build. */
  fences?: string[]
  /** Sowing plan: which field gets which crop. */
  sow?: { spaceIndex: number; crop: 'grain' | 'vegetable' }[]
  /** Farm Expansion builds stables instead of rooms when set. */
  stables?: boolean
  /** Card id to play on a Lessons or Major Improvement space. */
  cardId?: string
  /** Index of the chosen cost alternative, when a card offers a choice. */
  costOption?: number
  /** Which resource to take on the Resource Market space. */
  resource?: 'reed' | 'stone'
}

/**
 * Take an action space with one worker. Returns a failure without mutating the
 * state when the action is not legal.
 */
export function takeAction(
  state: GameState,
  spaceId: ActionSpaceId,
  payload: ActionPayload = {},
): ActionResult {
  if (state.phase !== 'work') return fail('notWorkPhase')
  if (!isSpaceAvailable(state, spaceId)) return fail('spaceUnavailable')

  const player = currentPlayer(state)
  if (workersLeft(player) <= 0) return fail('noWorkers')

  const result = applyAction(state, player, spaceId, payload)
  if (!result.ok) return result

  applyActionBonuses(state, player, spaceId)

  state.occupied[spaceId] = player.id
  player.peoplePlaced += 1
  advanceTurn(state)
  return ok
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

/**
 * Move animals between pastures, stables, and the house pet slot. Animals are
 * the only components a player may rearrange at any time, and doing so can
 * free capacity that automatic placement wasted.
 */
export function rearrangeAnimals(
  state: GameState,
  playerIndex: number,
  fromKey: string,
  toKey: string,
  count: number,
): ActionResult {
  const player = state.players[playerIndex]
  const result = moveAnimals(player, fromKey, toKey, count)
  if (!result.ok) return fail(result.reason)

  logMessage(state, 'moveAnimals', { name: player.name, count })
  return ok
}

/**
 * Convert goods into food using a played card ("Bake bread", cooking hearths,
 * and similar). Available at any time, which is how the rulebook treats these.
 */
export function convertGoods(
  state: GameState,
  playerIndex: number,
  cardId: string,
  units: number,
  /**
   * Which good to exchange. Cards like Cooking Hearth offer a rate per animal
   * type, so without this the first listed rate would always be used and every
   * other button on the card would silently fail.
   */
  good?: Payable,
): ActionResult {
  const player = state.players[playerIndex]
  const card = cardById(cardId)
  if (!card || !player.played.includes(cardId)) return fail('noSuchConversion')

  const effect = card.effects.find(
    (entry) => entry.kind === 'convert' && (good === undefined || entry.from === good),
  )
  if (effect?.kind !== 'convert') return fail('noSuchConversion')

  const amount = Math.min(units, effect.limit ?? units)
  if (amount <= 0 || player[effect.from] < amount) return fail('notEnoughToConvert')

  const food = Math.floor(amount * effect.rate)
  if (effect.from === 'sheep' || effect.from === 'boar' || effect.from === 'cattle') {
    // Animals live in housing placements, so removing them has to go through
    // there or the counters and the farm would disagree.
    removeAnimals(player, effect.from, amount)
  } else {
    player[effect.from] -= amount
  }
  player.food += food

  // The good and the card id are passed raw so the renderer can translate
  // them; only the numbers are baked in here.
  logMessage(state, 'convert', {
    name: player.name,
    amount,
    good: effect.from,
    count: food,
    cardId: card.id,
  })
  return ok
}

/** Goods a card adjustment may add or remove, in a stable display order. */
export const ADJUSTABLE_GOODS = [
  'wood',
  'clay',
  'reed',
  'stone',
  'grain',
  'vegetable',
  'food',
] as const satisfies readonly Payable[]

export type AdjustableGood = (typeof ADJUSTABLE_GOODS)[number]

/**
 * Apply a card effect the engine does not enforce.
 *
 * Most cards state their effect in prose the parser deliberately refuses to
 * interpret (see cards/parse.ts), so those cards would otherwise be unplayable:
 * readable, but with no way to act on them. This lets the table adjudicate the
 * wording and record the outcome, with the card named in the log so the history
 * stays auditable.
 *
 * Deliberately not validated against the card text — guessing at the wording is
 * exactly what makes a parser dangerous. The constraints are only that the card
 * is one the player actually holds and that goods never go negative.
 *
 * Animals are excluded: they live in housing placements with capacity rules, so
 * granting them here would desync the farm from the counters. Use the animal
 * panel for those.
 */
export function adjustForCard(
  state: GameState,
  playerIndex: number,
  cardId: string,
  good: AdjustableGood,
  delta: number,
): ActionResult {
  const player = state.players[playerIndex]
  if (!player) return fail('noSuchCardAdjustment')

  const card = cardById(cardId)
  if (!card || !player.played.includes(cardId)) return fail('noSuchCardAdjustment')

  if (!Number.isInteger(delta) || delta === 0) return fail('adjustmentAmount')
  if (!ADJUSTABLE_GOODS.includes(good)) return fail('adjustmentGood')

  if (player[good] + delta < 0) {
    return fail('notEnoughGoods', { good, count: player[good] })
  }
  player[good] += delta

  // The good and card id go through raw so the renderer localises them; the
  // sign picks the phrasing, since "gains -2 wood" reads badly in any language.
  logMessage(state, delta > 0 ? 'cardAdjustGain' : 'cardAdjustSpend', {
    name: player.name,
    amount: Math.abs(delta),
    good,
    cardId: card.id,
  })
  return ok
}

/** The cards this player has in front of them, resolved from their ids. */
function playedCards(player: Player) {
  return player.played.map(cardById).filter((card) => card !== undefined)
}

/** Grant any bonus goods the player's played cards attach to this space. */
function applyActionBonuses(state: GameState, player: Player, spaceId: ActionSpaceId): void {
  const cards = playedCards(player)
  const bonuses = actionBonuses(cards, spaceId)

  const gained: string[] = []
  for (const [good, amount] of Object.entries(bonuses)) {
    if (!amount) continue
    if (good === 'sheep' || good === 'boar' || good === 'cattle') {
      houseAnimals(player, good, amount)
      syncAnimalTotals(player)
    } else {
      player[good as Payable] += amount
    }
    gained.push(`${amount} ${good}`)
  }

  if (gained.length > 0) {
    logMessage(state, 'cardBonus', { name: player.name, goods: gained.join(', ') })
  }
}

function applyAction(
  state: GameState,
  player: Player,
  spaceId: ActionSpaceId,
  payload: ActionPayload,
): ActionResult {
  const space = findSpace(spaceId)
  if (!space) return fail('unknownSpace')

  // Accumulation spaces simply hand over everything sitting on them.
  if (space.accumulates) {
    return takeAccumulated(state, player, spaceId, space.accumulates.good)
  }

  switch (spaceId) {
    case 'grain-seeds':
      player.grain += 1
      logMessage(state, 'takeGoods', { name: player.name, amount: 1, good: 'grain' })
      return ok

    case 'vegetable-seeds':
      player.vegetable += 1
      logMessage(state, 'takeGoods', { name: player.name, amount: 1, good: 'vegetable' })
      return ok

    case 'resource-market': {
      // The player picks reed or stone; both come with 1 food.
      const choice = payload.resource ?? 'reed'
      if (choice !== 'reed' && choice !== 'stone') return fail('chooseReedOrStone')
      player[choice] += 1
      player.food += 1
      logMessage(state, 'resourceMarket', { name: player.name, resource: choice })
      return ok
    }

    case 'day-laborer':
      player.food += 2
      logMessage(state, 'takeGoods', { name: player.name, amount: 2, good: 'food' })
      return ok

    case 'meeting-place':
      state.pendingStartPlayer = state.players.indexOf(player)
      logMessage(state, 'startPlayer', { name: player.name })
      return ok

    case 'farmland':
      return plowField(state, player, payload.spaceIndex)

    case 'sow-and-bake': {
      // Cultivation: plow a field and/or sow. Both parts are optional.
      if (payload.spaceIndex !== undefined) {
        const plowed = plowField(state, player, payload.spaceIndex)
        if (!plowed.ok) return plowed
      }
      if (payload.sow?.length) return sowFields(state, player, payload.sow)
      if (payload.spaceIndex === undefined) return fail('choosePlowOrSow')
      return ok
    }

    case 'grain-utilization': {
      if (!payload.sow?.length) return fail('chooseFieldToSow')
      return sowFields(state, player, payload.sow)
    }

    case 'farm-expansion':
      return farmExpansion(state, player, payload)

    case 'fences':
      return buildFences(state, player, payload.fences ?? [])

    case 'house-redevelopment':
    case 'farm-redevelopment': {
      const renovated = renovate(state, player)
      if (!renovated.ok) return renovated
      // The bonus fence-building half of Farm Redevelopment is optional.
      if (spaceId === 'farm-redevelopment' && payload.fences?.length) {
        return buildFences(state, player, payload.fences)
      }
      return ok
    }

    case 'wish-for-children':
      return familyGrowth(state, player, { requireRoom: true })

    case 'urgent-wish-for-children':
      return familyGrowth(state, player, { requireRoom: false })

    case 'lessons':
    case 'lessons-2':
      return playOccupation(state, player, spaceId, payload)

    case 'major-improvement':
      return playImprovement(state, player, payload)

    default:
      return fail('notImplemented')
  }
}

function takeAccumulated(
  state: GameState,
  player: Player,
  spaceId: ActionSpaceId,
  good: ActionSpace['accumulates'] extends undefined ? never : NonNullable<ActionSpace['accumulates']>['good'],
): ActionResult {
  const amount = state.accumulated[spaceId] ?? 0
  if (amount <= 0) return fail('nothingAccumulated')

  if (good === 'sheep' || good === 'boar' || good === 'cattle') {
    const unhoused = houseAnimals(player, good, amount)
    syncAnimalTotals(player)
    state.accumulated[spaceId] = 0
    if (unhoused > 0) {
      logMessage(state, 'takeAnimalsPartial', { name: player.name, amount, good, lost: unhoused })
    } else {
      logMessage(state, 'takeGoods', { name: player.name, amount, good })
    }
    return ok
  }

  player[good] += amount
  state.accumulated[spaceId] = 0
  logMessage(state, 'takeGoods', { name: player.name, amount, good })
  return ok
}

function plowField(state: GameState, player: Player, spaceIndex?: number): ActionResult {
  if (spaceIndex === undefined) return fail('chooseSpaceToPlow')
  if (!canPlace(player.farm, spaceIndex, 'field')) {
    return fail('fieldAdjacency')
  }
  player.farm[spaceIndex] = { kind: 'field' }
  logMessage(state, 'plow', { name: player.name })
  return ok
}

function sowFields(
  state: GameState,
  player: Player,
  plan: { spaceIndex: number; crop: 'grain' | 'vegetable' }[],
): ActionResult {
  const needed = { grain: 0, vegetable: 0 }
  for (const { spaceIndex, crop } of plan) {
    const space = player.farm[spaceIndex]
    if (!space || space.kind !== 'field') return fail('sowOwnFields')
    if (space.crop) return fail('fieldAlreadySown')
    needed[crop] += 1
  }
  if (player.grain < needed.grain) return fail('notEnoughGrain')
  if (player.vegetable < needed.vegetable) return fail('notEnoughVegetables')

  for (const { spaceIndex, crop } of plan) {
    player[crop] -= 1
    player.farm[spaceIndex] = { kind: 'field', crop, cropCount: SOWN_FIELD_YIELD[crop] }
  }
  logMessage(state, 'sow', { name: player.name, count: plan.length })
  return ok
}

function farmExpansion(state: GameState, player: Player, payload: ActionPayload): ActionResult {
  const targets = payload.spaceIndices ?? (payload.spaceIndex !== undefined ? [payload.spaceIndex] : [])
  if (targets.length === 0) return fail('chooseWhereToBuild')

  return payload.stables
    ? buildStables(state, player, targets)
    : buildRooms(state, player, targets)
}

function buildRooms(state: GameState, player: Player, targets: number[]): ActionResult {
  const cost = ROOM_COST[player.house]
  const cards = playedCards(player)
  // Discounts apply per room built, and can never take a cost below zero.
  const perRoom = Math.max(0, cost.amount - discountFor(cards, cost.resource, 'room'))
  const perRoomReed = Math.max(0, cost.reed - discountFor(cards, 'reed', 'room'))
  const totalMaterial = perRoom * targets.length
  const totalReed = perRoomReed * targets.length

  if (player[cost.resource] < totalMaterial || player.reed < totalReed) {
    return fail('roomCost', { count: targets.length, material: totalMaterial, resource: cost.resource, reed: totalReed })
  }

  // Validate placement incrementally so each new room may chain off the last.
  const draft = player.farm.map((space) => ({ ...space }))
  for (const index of targets) {
    if (!canPlace(draft, index, 'room')) {
      return fail('roomAdjacency')
    }
    draft[index] = { kind: 'room' }
  }

  player.farm = draft
  player[cost.resource] -= totalMaterial
  player.reed -= totalReed
  logMessage(state, 'buildRooms', { name: player.name, count: targets.length, house: player.house })
  return ok
}

function buildStables(state: GameState, player: Player, targets: number[]): ActionResult {
  if (targets.length > player.stablesRemaining) {
    return fail('stablesRemaining', { count: player.stablesRemaining })
  }
  const cost = STABLE_COST_WOOD * targets.length
  if (player.wood < cost) return fail('stableCost', { count: targets.length, cost })

  for (const index of targets) {
    if (!canPlace(player.farm, index, 'stable')) return fail('stableNeedsSpace')
  }

  for (const index of targets) player.farm[index] = { kind: 'stable' }
  player.wood -= cost
  player.stablesRemaining -= targets.length
  logMessage(state, 'buildStables', { name: player.name, count: targets.length })
  return ok
}

/**
 * Build fences. The requested edges must be affordable, within supply, and
 * must leave every newly enclosed region legally fenced.
 */
export function buildFences(state: GameState, player: Player, edges: string[]): ActionResult {
  const additions = edges.filter((edge) => !player.fences.includes(edge))
  if (additions.length === 0) return fail('chooseFence')
  if (additions.length > player.fencesRemaining) {
    return fail('fencesRemaining', { count: player.fencesRemaining })
  }

  const cost = additions.length * FENCE_COST_WOOD
  if (player.wood < cost) return fail('fenceCost', { count: additions.length, cost })

  const proposed = [...player.fences, ...additions]
  // Fences must always complete a new enclosure or subdivide an existing one,
  // so the resulting set of pastures has to differ from what was there before.
  const before = findPastures(player.fences)
  const after = findPastures(proposed)
  const beforeKeys = new Set(before.map((pasture) => pasture.key))
  if (after.length === before.length && after.every((pasture) => beforeKeys.has(pasture.key))) {
    return fail('fenceMustEnclose')
  }

  // Every new fence must itself border a pasture. Without this, a legal
  // enclosure could be bundled with dangling segments that enclose nothing —
  // the player would pay wood for fences the rulebook does not allow.
  const boundary = pastureBoundaryEdges(proposed)
  if (additions.some((edge) => !boundary.has(edge))) {
    return fail('fenceMustEnclose')
  }

  // A pasture may not enclose a room; fields inside are allowed by the rules
  // but would strand the crops, so we block rooms only.
  for (const pasture of after) {
    if (pasture.spaces.some((index) => player.farm[index].kind === 'room')) {
      return fail('cannotFenceHouse')
    }
  }

  player.fences = proposed
  player.fencesRemaining -= additions.length
  player.wood -= cost
  logMessage(state, 'buildFences', { name: player.name, count: additions.length })
  return ok
}

function renovate(state: GameState, player: Player): ActionResult {
  if (player.house === 'stone') return fail('alreadyStone')
  const target = RENOVATION_TARGET[player.house]
  const material = target === 'clay' ? 'clay' : 'stone'
  const cards = playedCards(player)
  const rooms = Math.max(
    0,
    countKind(player.farm, 'room') - discountFor(cards, material, 'renovation'),
  )
  const reedCost = Math.max(0, 1 - discountFor(cards, 'reed', 'renovation'))

  if (player[material] < rooms || player.reed < reedCost) {
    return fail('renovationCost', { count: rooms, material })
  }

  player[material] -= rooms
  player.reed -= reedCost
  player.house = target
  logMessage(state, 'renovate', { name: player.name, house: target })
  return ok
}

/**
 * Occupation cost, per the rulebook: on the base Lessons space the first
 * occupation is free and later ones cost 1 food. The extra space in 3- and
 * 4-player games charges more.
 */
export function occupationCost(
  playerCount: number,
  spaceId: ActionSpaceId,
  occupationsPlayed: number,
): number {
  if (spaceId === 'lessons') return occupationsPlayed === 0 ? 0 : 1
  if (playerCount === 3) return 2
  if (playerCount === 4) return occupationsPlayed < 2 ? 1 : 2
  return 1
}

function playOccupation(
  state: GameState,
  player: Player,
  spaceId: ActionSpaceId,
  payload: ActionPayload,
): ActionResult {
  if (!payload.cardId) return fail('chooseOccupation')
  if (!player.hand.occupations.includes(payload.cardId)) {
    return fail('occupationNotInHand')
  }

  const card = cardById(payload.cardId)
  if (!card) return fail('unknownCard')

  const played = player.played.filter((id) => cardById(id)?.type === 'occupation').length
  const cost = occupationCost(state.players.length, spaceId, played)
  if (player.food < cost) return fail('occupationCost', { count: cost })

  player.food -= cost
  player.hand.occupations = player.hand.occupations.filter((id) => id !== payload.cardId)
  player.played.push(card.id)
  applyImmediateEffects(player, card)
  player.roundGoods.push(...scheduledDrips(card, state.round))

  logMessage(state, 'playOccupation', { name: player.name, card: card.title })
  if (!card.enforced) {
    logMessage(state, 'manualCard', { card: card.title, text: card.text })
  }
  return ok
}

/**
 * Play a minor improvement from hand, or build a major improvement from the
 * shared pool.
 */
function playImprovement(state: GameState, player: Player, payload: ActionPayload): ActionResult {
  if (!payload.cardId) return fail('chooseImprovement')

  const card = cardById(payload.cardId)
  if (!card) return fail('unknownCard')

  const fromHand = player.hand.minors.includes(card.id)
  const fromPool = state.majorsAvailable.includes(card.id)
  if (!fromHand && !fromPool) return fail('improvementUnavailable')

  const options = affordableOptions(player, card)
  if (options.length === 0) return fail('cannotAfford', { card: card.title })

  const chosen = options[payload.costOption ?? 0] ?? options[0]
  payOption(player, chosen)

  if (fromHand) player.hand.minors = player.hand.minors.filter((id) => id !== card.id)
  else state.majorsAvailable = state.majorsAvailable.filter((id) => id !== card.id)

  player.played.push(card.id)
  applyImmediateEffects(player, card)
  player.roundGoods.push(...scheduledDrips(card, state.round))

  logMessage(state, 'buildImprovement', { name: player.name, card: card.title })
  if (!card.enforced) {
    logMessage(state, 'manualCard', { card: card.title, text: card.text })
  }
  return ok
}

function familyGrowth(
  state: GameState,
  player: Player,
  { requireRoom }: { requireRoom: boolean },
): ActionResult {
  if (player.people >= MAX_PEOPLE) return fail('maxPeople')
  if (requireRoom && player.people >= countKind(player.farm, 'room')) {
    return fail('needEmptyRoom')
  }

  player.people += 1
  player.newborns += 1
  logMessage(state, 'familyGrowth', { name: player.name, count: player.people })
  return ok
}

/** Convenience for the UI: is this pasture holding animals of a given type? */
export function pastureSummary(player: Player) {
  const placements = new Map(player.animalPlacement.map((p) => [p.key, p]))
  return pastureInfo(player).map((pasture) => ({
    ...pasture,
    occupant: placements.get(pasture.key) ?? null,
  }))
}

/** Every fence edge that borders at least one space, for UI rendering. */
export function fenceSlotsForSpace(index: number) {
  return edgesOfSpace(index)
}
