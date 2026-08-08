import { createGame, STATE_VERSION } from '../src/game/engine'
import { houseAnimals } from '../src/game/farm'
import type { GameState } from '../src/game/types'

/**
 * A mid-game board built by the engine itself, so what the screenshots show
 * could actually occur: sown fields, a fenced pasture with animals in it, a
 * clay house, cards played, goods on the action spaces.
 *
 * Deterministic in every part — a fixed shuffle seed, no dates, no randomness
 * — because a baseline that drifts is worse than no baseline.
 */
export function seededGame(): GameState {
  const game = createGame({ names: ['Ana', 'Bo', 'Cy'], random: () => 0.42 })
  game.round = 7

  const [ana, bo] = game.players

  ana.house = 'clay'
  ana.farm[0] = { kind: 'room' }
  ana.farm[5] = { kind: 'room' }
  ana.farm[10] = { kind: 'room' }
  ana.farm[1] = { kind: 'field', crop: 'grain', cropCount: 3 }
  ana.farm[6] = { kind: 'field', crop: 'vegetable', cropCount: 2 }
  ana.farm[11] = { kind: 'field' }
  ana.farm[8] = { kind: 'stable' }
  // A fenced 2x2 pasture over spaces 3, 4, 8 and 9.
  ana.fences = ['h:0:2', 'h:0:3', 'h:2:2', 'h:2:3', 'v:0:2', 'v:1:2', 'v:0:4', 'v:1:4']
  ana.fencesRemaining = 7
  ana.stablesRemaining = 3
  Object.assign(ana, { wood: 5, clay: 3, reed: 2, stone: 1, grain: 2, vegetable: 1, food: 4 })
  ana.people = 3
  ana.played = ['major-clay-oven', 'occupation-net-fisherman']

  bo.farm[1] = { kind: 'field', crop: 'grain', cropCount: 1 }
  Object.assign(bo, { wood: 2, food: 1 })

  houseAnimals(ana, 'sheep', 3)
  houseAnimals(ana, 'cattle', 2)
  houseAnimals(bo, 'sheep', 1)

  game.accumulated = { ...game.accumulated, forest: 6, 'clay-pit': 3, reed: 4 }
  game.occupied = { forest: bo.id }
  game.log = [
    { round: 6, key: 'roundBegins', values: { round: 6 } },
    { round: 6, key: 'plow', values: { name: 'Ana' } },
    { round: 7, key: 'roundBegins', values: { round: 7 } },
  ]

  return game
}

/** What the app expects to find in localStorage for a saved game. */
export function savedGame(): string {
  return JSON.stringify({
    state: { game: seededGame(), history: [], future: [] },
    version: STATE_VERSION,
  })
}
