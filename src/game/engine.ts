/**
 * Game engine: setup, worker placement, the three harvest phases, and round
 * progression. All functions mutate a draft state and return a result telling
 * the caller whether the action was legal.
 */

import { edgesOfSpace, findPastures, SPACE_COUNT } from './geometry'
import { canPlace, countKind, houseAnimals, pastureInfo, syncAnimalTotals } from './farm'
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

export type ActionResult = { ok: true } | { ok: false; reason: string }

const ok: ActionResult = { ok: true }
const fail = (reason: string): ActionResult => ({ ok: false, reason })

const COLORS: PlayerColor[] = ['green', 'blue', 'red', 'purple']

export const STATE_VERSION = 3

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

function makePlayer(name: string, index: number): Player {
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
  const players = names.map((name, index) => makePlayer(name, index))
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
    log: [],
    harvest: null,
  }

  // Stash the deck order on the state so later rounds reveal deterministically.
  deckOrder.set(state, deck)
  revealForRound(state, deck)
  replenish(state, playerCount)
  logMessage(state, `Round 1 begins. ${players[0].name} is the start player.`)
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
    if (space) logMessage(state, `New action space revealed: ${space.name}.`)
  }
}

/** Add this round's goods to every accumulating space that is in play. */
function replenish(state: GameState, playerCount = state.players.length): void {
  for (const space of allSpacesFor(playerCount)) {
    if (!space.accumulates) continue
    const inPlay = space.stage === 0 || state.revealed.includes(space.id)
    if (!inPlay) continue
    // Solo games get 2 wood on the Forest instead of 3.
    const amount =
      space.id === 'forest' && playerCount === 1 ? 2 : space.accumulates.amount
    state.accumulated[space.id] = (state.accumulated[space.id] ?? 0) + amount
  }
}

export function logMessage(state: GameState, message: string): void {
  state.log.push({ round: state.round, message })
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
  logMessage(state, `Round ${state.round} work phase complete.`)

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
    logMessage(state, 'The game is over. Time to score the farms.')
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
  logMessage(state, `Round ${state.round} begins.`)
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
      logMessage(state, `${player.name} harvests ${harvested} crop(s) from their fields.`)
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
    logMessage(state, `${player.name} cannot feed their family and begs for ${missing} food.`)
  } else {
    logMessage(state, `${player.name} feeds their family (${required} food).`)
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

  syncAnimalTotals(player)
  for (const type of ['sheep', 'boar', 'cattle'] as const) {
    if (player[type] < 2) continue
    if (houseAnimals(player, type, 1) === 0) born.push(type)
  }

  syncAnimalTotals(player)
  if (born.length > 0) {
    logMessage(state, `${player.name}'s animals breed: ${born.join(', ')}.`)
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
  logMessage(state, 'Harvest complete.')
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
  if (state.phase !== 'work') return fail('Not in the work phase.')
  if (!isSpaceAvailable(state, spaceId)) return fail('That action space is not available.')

  const player = currentPlayer(state)
  if (workersLeft(player) <= 0) return fail('You have no people left to place.')

  const result = applyAction(state, player, spaceId, payload)
  if (!result.ok) return result

  state.occupied[spaceId] = player.id
  player.peoplePlaced += 1
  advanceTurn(state)
  return ok
}

function applyAction(
  state: GameState,
  player: Player,
  spaceId: ActionSpaceId,
  payload: ActionPayload,
): ActionResult {
  const space = findSpace(spaceId)
  if (!space) return fail('Unknown action space.')

  // Accumulation spaces simply hand over everything sitting on them.
  if (space.accumulates) {
    return takeAccumulated(state, player, spaceId, space.accumulates.good)
  }

  switch (spaceId) {
    case 'grain-seeds':
      player.grain += 1
      logMessage(state, `${player.name} takes 1 grain.`)
      return ok

    case 'vegetable-seeds':
      player.vegetable += 1
      logMessage(state, `${player.name} takes 1 vegetable.`)
      return ok

    case 'day-laborer':
      player.food += 2
      logMessage(state, `${player.name} works as a day laborer for 2 food.`)
      return ok

    case 'meeting-place':
      state.pendingStartPlayer = state.players.indexOf(player)
      logMessage(state, `${player.name} will be the start player next round.`)
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
      if (payload.spaceIndex === undefined) return fail('Choose a field to plow or crops to sow.')
      return ok
    }

    case 'grain-utilization': {
      if (!payload.sow?.length) return fail('Choose at least one field to sow.')
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
    case 'major-improvement':
      // Cards are out of scope for the base-game build; the space is a no-op
      // that still costs a worker, so the board stays rule-accurate.
      logMessage(state, `${player.name} uses ${space.name} (cards not yet implemented).`)
      return ok

    default:
      return fail('That action is not implemented.')
  }
}

function takeAccumulated(
  state: GameState,
  player: Player,
  spaceId: ActionSpaceId,
  good: ActionSpace['accumulates'] extends undefined ? never : NonNullable<ActionSpace['accumulates']>['good'],
): ActionResult {
  const amount = state.accumulated[spaceId] ?? 0
  if (amount <= 0) return fail('There is nothing on that space yet.')

  if (good === 'sheep' || good === 'boar' || good === 'cattle') {
    const unhoused = houseAnimals(player, good, amount)
    syncAnimalTotals(player)
    state.accumulated[spaceId] = 0
    if (unhoused > 0) {
      logMessage(
        state,
        `${player.name} takes ${amount} ${good} but ${unhoused} wander off for lack of space.`,
      )
    } else {
      logMessage(state, `${player.name} takes ${amount} ${good}.`)
    }
    return ok
  }

  player[good] += amount
  state.accumulated[spaceId] = 0
  logMessage(state, `${player.name} takes ${amount} ${good}.`)
  return ok
}

function plowField(state: GameState, player: Player, spaceIndex?: number): ActionResult {
  if (spaceIndex === undefined) return fail('Choose a space to plow.')
  if (!canPlace(player.farm, spaceIndex, 'field')) {
    return fail('Fields must be placed on an empty space adjacent to your other fields.')
  }
  player.farm[spaceIndex] = { kind: 'field' }
  logMessage(state, `${player.name} plows a field.`)
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
    if (!space || space.kind !== 'field') return fail('You can only sow on your own fields.')
    if (space.crop) return fail('That field is already sown.')
    needed[crop] += 1
  }
  if (player.grain < needed.grain) return fail('Not enough grain to sow.')
  if (player.vegetable < needed.vegetable) return fail('Not enough vegetables to sow.')

  for (const { spaceIndex, crop } of plan) {
    player[crop] -= 1
    player.farm[spaceIndex] = { kind: 'field', crop, cropCount: SOWN_FIELD_YIELD[crop] }
  }
  logMessage(state, `${player.name} sows ${plan.length} field(s).`)
  return ok
}

function farmExpansion(state: GameState, player: Player, payload: ActionPayload): ActionResult {
  const targets = payload.spaceIndices ?? (payload.spaceIndex !== undefined ? [payload.spaceIndex] : [])
  if (targets.length === 0) return fail('Choose where to build.')

  return payload.stables
    ? buildStables(state, player, targets)
    : buildRooms(state, player, targets)
}

function buildRooms(state: GameState, player: Player, targets: number[]): ActionResult {
  const cost = ROOM_COST[player.house]
  const totalMaterial = cost.amount * targets.length
  const totalReed = cost.reed * targets.length

  if (player[cost.resource] < totalMaterial || player.reed < totalReed) {
    return fail(`Building ${targets.length} room(s) costs ${totalMaterial} ${cost.resource} and ${totalReed} reed.`)
  }

  // Validate placement incrementally so each new room may chain off the last.
  const draft = player.farm.map((space) => ({ ...space }))
  for (const index of targets) {
    if (!canPlace(draft, index, 'room')) {
      return fail('Rooms must be built on empty spaces adjacent to your house.')
    }
    draft[index] = { kind: 'room' }
  }

  player.farm = draft
  player[cost.resource] -= totalMaterial
  player.reed -= totalReed
  logMessage(state, `${player.name} builds ${targets.length} ${player.house} room(s).`)
  return ok
}

function buildStables(state: GameState, player: Player, targets: number[]): ActionResult {
  if (targets.length > player.stablesRemaining) {
    return fail(`You only have ${player.stablesRemaining} stable(s) left.`)
  }
  const cost = STABLE_COST_WOOD * targets.length
  if (player.wood < cost) return fail(`Building ${targets.length} stable(s) costs ${cost} wood.`)

  for (const index of targets) {
    if (!canPlace(player.farm, index, 'stable')) return fail('Stables need an empty space.')
  }

  for (const index of targets) player.farm[index] = { kind: 'stable' }
  player.wood -= cost
  player.stablesRemaining -= targets.length
  logMessage(state, `${player.name} builds ${targets.length} stable(s).`)
  return ok
}

/**
 * Build fences. The requested edges must be affordable, within supply, and
 * must leave every newly enclosed region legally fenced.
 */
export function buildFences(state: GameState, player: Player, edges: string[]): ActionResult {
  const additions = edges.filter((edge) => !player.fences.includes(edge))
  if (additions.length === 0) return fail('Choose at least one new fence to build.')
  if (additions.length > player.fencesRemaining) {
    return fail(`You only have ${player.fencesRemaining} fence(s) left.`)
  }

  const cost = additions.length * FENCE_COST_WOOD
  if (player.wood < cost) return fail(`Building ${additions.length} fence(s) costs ${cost} wood.`)

  const proposed = [...player.fences, ...additions]
  // Fences must always complete a new enclosure or subdivide an existing one,
  // so the resulting set of pastures has to differ from what was there before.
  const before = findPastures(player.fences)
  const after = findPastures(proposed)
  const beforeKeys = new Set(before.map((pasture) => pasture.key))
  if (after.length === before.length && after.every((pasture) => beforeKeys.has(pasture.key))) {
    return fail('Fences must form a fully enclosed pasture.')
  }

  // A pasture may not enclose a room; fields inside are allowed by the rules
  // but would strand the crops, so we block rooms only.
  for (const pasture of after) {
    if (pasture.spaces.some((index) => player.farm[index].kind === 'room')) {
      return fail('You cannot fence in your house.')
    }
  }

  player.fences = proposed
  player.fencesRemaining -= additions.length
  player.wood -= cost
  logMessage(state, `${player.name} builds ${additions.length} fence(s).`)
  return ok
}

function renovate(state: GameState, player: Player): ActionResult {
  if (player.house === 'stone') return fail('Your house is already stone.')
  const target = RENOVATION_TARGET[player.house]
  const material = target === 'clay' ? 'clay' : 'stone'
  const rooms = countKind(player.farm, 'room')

  if (player[material] < rooms || player.reed < 1) {
    return fail(`Renovating costs ${rooms} ${material} and 1 reed.`)
  }

  player[material] -= rooms
  player.reed -= 1
  player.house = target
  logMessage(state, `${player.name} renovates to a ${target} house.`)
  return ok
}

function familyGrowth(
  state: GameState,
  player: Player,
  { requireRoom }: { requireRoom: boolean },
): ActionResult {
  if (player.people >= MAX_PEOPLE) return fail('You already have five people.')
  if (requireRoom && player.people >= countKind(player.farm, 'room')) {
    return fail('You need an empty room to grow your family.')
  }

  player.people += 1
  player.newborns += 1
  logMessage(state, `${player.name}'s family grows to ${player.people}.`)
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
