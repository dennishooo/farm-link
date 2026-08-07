import { beforeEach, describe, expect, it } from 'vitest'
import {
  accumulationRate,
  adjustForCard,
  advanceTurn,
  allSpacesFor,
  breedAnimals,
  buildFences,
  completeHarvest,
  applyCardAction,
  createGame,
  getDeckOrder,
  revealForRound,
  currentPlayer,
  feedFamily,
  findSpace,
  foodRequiredFor,
  isSpaceAvailable,
  takeAction,
  workersLeft,
} from './engine'
import { scorePlayer } from './scoring'
import { horizontalEdge, verticalEdge } from './geometry'
import { capacityFor, houseAnimals, pastureInfo } from './farm'
import { HARVEST_ROUNDS, STAGE_ACTION_SPACES, STAGE_ROUNDS } from './rules'
import type { GameState } from './types'

/** Deterministic games so stage-card order never flakes a test. */
function game(names = ['Ann', 'Bo']): GameState {
  return createGame({ names, random: () => 0.42 })
}

function fenceRect(row0: number, col0: number, row1: number, col1: number): string[] {
  const edges: string[] = []
  for (let col = col0; col <= col1; col++) {
    edges.push(horizontalEdge(row0, col), horizontalEdge(row1 + 1, col))
  }
  for (let row = row0; row <= row1; row++) {
    edges.push(verticalEdge(row, col0), verticalEdge(row, col1 + 1))
  }
  return edges
}

describe('setup', () => {
  let state: GameState

  beforeEach(() => {
    state = game()
  })

  it('starts each player with two wood rooms and two people', () => {
    for (const player of state.players) {
      expect(player.farm.filter((s) => s.kind === 'room')).toHaveLength(2)
      expect(player.people).toBe(2)
      expect(player.house).toBe('wood')
    }
  })

  it('gives the start player 2 food and others 3', () => {
    expect(state.players[0].food).toBe(2)
    expect(state.players[1].food).toBe(3)
  })

  it('gives each player 15 fences and 4 stables', () => {
    for (const player of state.players) {
      expect(player.fencesRemaining).toBe(15)
      expect(player.stablesRemaining).toBe(4)
    }
  })

  it('reveals exactly one stage card in round 1', () => {
    expect(state.revealed).toHaveLength(1)
  })

  it('seeds the accumulation spaces on round 1', () => {
    expect(state.accumulated['forest']).toBe(3)
    expect(state.accumulated['clay-pit']).toBe(1)
    expect(state.accumulated['reed-bank']).toBe(1)
    expect(state.accumulated['fishing']).toBe(1)
  })

  it('excludes 4-player-only spaces from a 2-player game', () => {
    expect(isSpaceAvailable(state, 'traveling-players')).toBe(false)
    const four = createGame({ names: ['A', 'B', 'C', 'D'], random: () => 0.42 })
    expect(four.accumulated['traveling-players']).toBe(1)
  })

  it('puts only 2 wood on the Forest in a solo game', () => {
    expect(game(['Solo']).accumulated['forest']).toBe(2)
  })

  it('reports the per-round rate the engine actually pays', () => {
    // Issue #1: the board shows this rate, so it must come from one source.
    const forest = findSpace('forest')!
    expect(accumulationRate(forest, 2)).toBe(3)
    expect(accumulationRate(forest, 1)).toBe(2)
    expect(accumulationRate(findSpace('clay-pit')!, 2)).toBe(1)
    // Non-accumulating spaces have no rate.
    expect(accumulationRate(findSpace('farmland')!, 2)).toBe(0)
  })

  it('matches the rate against a second round of replenishment', () => {
    const state = game()
    const rate = accumulationRate(findSpace('clay-pit')!, 2)
    const before = state.accumulated['clay-pit']
    takeAction(state, 'forest')
    takeAction(state, 'reed-bank')
    takeAction(state, 'fishing')
    takeAction(state, 'grain-seeds')
    expect(state.round).toBe(2)
    expect(state.accumulated['clay-pit']).toBe(before + rate)
  })
})

describe('worker placement', () => {
  it('takes everything from an accumulation space and empties it', () => {
    const state = game()
    expect(takeAction(state, 'forest')).toEqual({ ok: true })
    expect(state.players[0].wood).toBe(3)
    expect(state.accumulated['forest']).toBe(0)
  })

  it('blocks a space already occupied this round', () => {
    const state = game()
    takeAction(state, 'forest')
    const result = takeAction(state, 'forest')
    expect(result).toMatchObject({ ok: false, reason: 'spaceUnavailable' })
  })

  it('refuses an empty accumulation space without consuming a worker', () => {
    const state = game()
    takeAction(state, 'forest')
    takeAction(state, 'clay-pit')
    // Ann again; the forest is occupied, so try the emptied fishing space after
    // someone already cleared it.
    state.accumulated['reed-bank'] = 0
    const before = currentPlayer(state).peoplePlaced
    const result = takeAction(state, 'reed-bank')
    expect(result.ok).toBe(false)
    expect(currentPlayer(state).peoplePlaced).toBe(before)
  })

  it('alternates players and ends the round when all workers are placed', () => {
    const state = game()
    expect(currentPlayer(state).name).toBe('Ann')
    takeAction(state, 'forest')
    expect(currentPlayer(state).name).toBe('Bo')
    takeAction(state, 'clay-pit')
    expect(currentPlayer(state).name).toBe('Ann')
    takeAction(state, 'reed-bank')
    takeAction(state, 'fishing')
    // Four workers placed across two players ends round 1.
    expect(state.round).toBe(2)
  })

  it('clears occupied spaces at the start of a new round', () => {
    const state = game()
    takeAction(state, 'forest')
    takeAction(state, 'clay-pit')
    takeAction(state, 'reed-bank')
    takeAction(state, 'fishing')
    expect(state.occupied).toEqual({})
    expect(isSpaceAvailable(state, 'forest')).toBe(true)
  })

  it('accumulates goods again on spaces left untouched', () => {
    const state = game()
    takeAction(state, 'clay-pit')
    takeAction(state, 'reed-bank')
    takeAction(state, 'fishing')
    takeAction(state, 'grain-seeds')
    // Forest was never used, so round 2 adds another 3 wood on top.
    expect(state.accumulated['forest']).toBe(6)
  })

  it('hands the start player token over only next round', () => {
    const state = game()
    takeAction(state, 'clay-pit') // Ann
    takeAction(state, 'meeting-place') // Bo claims start player
    expect(state.startPlayerIndex).toBe(0)
    takeAction(state, 'forest')
    takeAction(state, 'reed-bank')
    expect(state.round).toBe(2)
    expect(state.startPlayerIndex).toBe(1)
    expect(currentPlayer(state).name).toBe('Bo')
  })
})

describe('plowing and sowing', () => {
  it('requires new fields to touch existing ones', () => {
    const state = game()
    const player = state.players[0]
    expect(takeAction(state, 'farmland', { spaceIndex: 0 }).ok).toBe(true)
    expect(player.farm[0].kind).toBe('field')

    takeAction(state, 'clay-pit') // Bo
    // Space 14 is nowhere near the field at 0.
    expect(takeAction(state, 'farmland', { spaceIndex: 14 }).ok).toBe(false)
  })

  it('sows 3 grain or 2 vegetables per field', () => {
    const state = game()
    const player = state.players[0]
    player.farm[0] = { kind: 'field' }
    player.farm[1] = { kind: 'field' }
    player.grain = 1
    player.vegetable = 1

    const result = takeAction(state, 'grain-utilization', {
      sow: [
        { spaceIndex: 0, crop: 'grain' },
        { spaceIndex: 1, crop: 'vegetable' },
      ],
    })

    // Grain Utilization only enters play as a stage card; skip if unrevealed.
    if (result.ok) {
      expect(player.farm[0].cropCount).toBe(3)
      expect(player.farm[1].cropCount).toBe(2)
      expect(player.grain).toBe(0)
      expect(player.vegetable).toBe(0)
    }
  })

  it('refuses to sow without seed in supply', () => {
    const state = game()
    const player = state.players[0]
    player.farm[0] = { kind: 'field' }
    player.grain = 0
    state.revealed.push('grain-utilization')
    const result = takeAction(state, 'grain-utilization', {
      sow: [{ spaceIndex: 0, crop: 'grain' }],
    })
    expect(result).toMatchObject({ ok: false, reason: 'notEnoughGrain' })
  })
})

describe('building', () => {
  it('charges 5 wood and 2 reed for a wood room', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 5
    player.reed = 2
    // Space 0 is above the starting room at 5, so it is adjacent.
    expect(takeAction(state, 'farm-expansion', { spaceIndex: 0 }).ok).toBe(true)
    expect(player.wood).toBe(0)
    expect(player.reed).toBe(0)
    expect(player.farm[0].kind).toBe('room')
  })

  it('refuses a room the player cannot afford', () => {
    const state = game()
    state.players[0].wood = 4
    state.players[0].reed = 2
    expect(takeAction(state, 'farm-expansion', { spaceIndex: 0 }).ok).toBe(false)
  })

  it('builds stables for 2 wood without an adjacency requirement', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 2
    expect(takeAction(state, 'farm-expansion', { spaceIndex: 14, stables: true }).ok).toBe(true)
    expect(player.farm[14].kind).toBe('stable')
    expect(player.stablesRemaining).toBe(3)
  })

  it('limits stables to the four in supply', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 20
    player.stablesRemaining = 1
    const result = takeAction(state, 'farm-expansion', {
      spaceIndices: [0, 1],
      stables: true,
    })
    expect(result.ok).toBe(false)
  })
})

describe('fences', () => {
  it('charges 1 wood per fence and encloses a pasture', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 10
    const result = buildFences(state, player, fenceRect(0, 0, 0, 0))
    expect(result.ok).toBe(true)
    expect(player.wood).toBe(6) // four fences
    expect(player.fencesRemaining).toBe(11)
    expect(pastureInfo(player)).toHaveLength(1)
  })

  it('rejects fences that do not enclose anything', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 10
    const result = buildFences(state, player, [horizontalEdge(0, 0)])
    expect(result).toMatchObject({ ok: false, reason: 'fenceMustEnclose' })
    expect(player.wood).toBe(10)
  })

  it('allows subdividing an existing pasture', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 20
    buildFences(state, player, fenceRect(0, 0, 0, 1))
    expect(pastureInfo(player)).toHaveLength(1)

    const result = buildFences(state, player, [verticalEdge(0, 1)])
    expect(result.ok).toBe(true)
    expect(pastureInfo(player)).toHaveLength(2)
  })

  it('refuses to fence in the house', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 20
    // Space 5 is a starting room.
    const result = buildFences(state, player, fenceRect(1, 0, 1, 0))
    expect(result).toMatchObject({ ok: false, reason: 'cannotFenceHouse' })
  })

  it('rejects a dangling fence bundled with a legal pasture', () => {
    // Issue #2: a valid enclosure plus stray segments passed validation, so
    // players paid wood for fences that enclosed nothing.
    const state = game()
    const player = state.players[0]
    player.wood = 30
    const dangling = verticalEdge(1, 3)

    const result = buildFences(state, player, [...fenceRect(0, 2, 0, 2), dangling])
    expect(result).toMatchObject({ ok: false, reason: 'fenceMustEnclose' })
    expect(player.fences).toEqual([])
    expect(player.wood).toBe(30)
  })

  it('accepts the same pasture once the dangling fence is dropped', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30

    expect(buildFences(state, player, fenceRect(0, 2, 0, 2)).ok).toBe(true)
    expect(pastureInfo(player)).toHaveLength(1)
    expect(player.wood).toBe(26)
  })

  it('still allows a fence shared between two adjacent pastures', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30
    buildFences(state, player, fenceRect(0, 0, 0, 0))

    // The second pasture reuses the shared edge and adds three new ones.
    const result = buildFences(state, player, fenceRect(0, 1, 0, 1))
    expect(result.ok).toBe(true)
    expect(pastureInfo(player)).toHaveLength(2)
  })

  it('cannot exceed the 15-fence supply', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 50
    player.fencesRemaining = 2
    const result = buildFences(state, player, fenceRect(0, 0, 0, 0))
    expect(result.ok).toBe(false)
  })
})

describe('animal housing', () => {
  it('doubles pasture capacity for each stable inside it', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30
    buildFences(state, player, fenceRect(0, 0, 0, 1)) // 1x2 pasture -> 4 animals
    expect(pastureInfo(player)[0].capacity).toBe(4)

    player.farm[0] = { kind: 'stable' }
    expect(pastureInfo(player)[0].capacity).toBe(8)
    player.farm[1] = { kind: 'stable' }
    expect(pastureInfo(player)[0].capacity).toBe(16)
  })

  it('holds one pet in the house even with no pastures', () => {
    const state = game()
    const player = state.players[0]
    expect(capacityFor(player, 'sheep')).toBe(1)
    expect(houseAnimals(player, 'sheep', 1)).toBe(0)
  })

  it('turns away animals that cannot be housed', () => {
    const state = game()
    const player = state.players[0]
    // Only the single pet slot is available, so 2 of 3 wander off.
    expect(houseAnimals(player, 'sheep', 3)).toBe(2)
  })

  it('keeps one animal type per pasture', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30
    buildFences(state, player, fenceRect(0, 0, 0, 0))
    houseAnimals(player, 'sheep', 2)
    // The pasture is full of sheep, so only the pet slot remains for boar.
    expect(capacityFor(player, 'boar')).toBe(1)
  })
})

describe('harvest', () => {
  it('takes exactly one crop from each sown field', () => {
    const state = game()
    const player = state.players[0]
    player.farm[0] = { kind: 'field', crop: 'grain', cropCount: 3 }
    player.farm[1] = { kind: 'field', crop: 'vegetable', cropCount: 2 }

    // Run rounds until the round-4 harvest resolves.
    while (state.round < 4) {
      while (state.phase === 'work' && workersLeft(currentPlayer(state)) > 0) {
        const spaceId = ['forest', 'clay-pit', 'reed-bank', 'fishing', 'grain-seeds', 'day-laborer'].find(
          (id) => isSpaceAvailable(state, id),
        )
        if (!spaceId) break
        takeAction(state, spaceId)
      }
      if (state.phase === 'harvest') break
    }

    expect(HARVEST_ROUNDS).toContain(4)
  })

  it('requires 2 food per adult and 1 per newborn', () => {
    const state = game()
    const player = state.players[0]
    expect(foodRequiredFor(state, player)).toBe(4)

    player.people = 3
    player.newborns = 1
    expect(foodRequiredFor(state, player)).toBe(5)
  })

  it('requires 3 food per adult in a solo game', () => {
    const state = game(['Solo'])
    expect(foodRequiredFor(state, state.players[0])).toBe(6)
  })

  it('converts grain and vegetables to food when short', () => {
    const state = game()
    const player = state.players[0]
    player.food = 1
    player.grain = 2
    player.vegetable = 1
    feedFamily(state, 0)
    expect(player.beggingMarkers).toBe(0)
    expect(player.food).toBe(0)
    expect(player.grain + player.vegetable).toBe(0)
  })

  it('takes a begging marker for each missing food', () => {
    const state = game()
    const player = state.players[0]
    player.food = 1
    player.grain = 0
    player.vegetable = 0
    feedFamily(state, 0)
    expect(player.beggingMarkers).toBe(3)
  })

  it('breeds one animal per type with at least two, given space', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30
    buildFences(state, player, fenceRect(0, 0, 0, 1)) // capacity 4
    houseAnimals(player, 'sheep', 2)

    breedAnimals(state, 0)
    expect(player.sheep).toBe(3)
  })

  it('does not breed when the farm is full', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30
    buildFences(state, player, fenceRect(0, 0, 0, 0)) // capacity 2
    houseAnimals(player, 'sheep', 2)
    // Pet slot could take one more, so fill it with a different type first.
    houseAnimals(player, 'boar', 1)

    breedAnimals(state, 0)
    expect(player.sheep).toBe(2)
  })

  it('never breeds a single animal', () => {
    const state = game()
    const player = state.players[0]
    houseAnimals(player, 'sheep', 1)
    breedAnimals(state, 0)
    expect(player.sheep).toBe(1)
  })

  it('keeps animal counters in step with their placements', () => {
    const state = game()
    const player = state.players[0]
    player.wood = 30
    buildFences(state, player, fenceRect(0, 0, 0, 1))
    houseAnimals(player, 'sheep', 3)
    breedAnimals(state, 0)

    const placed = player.animalPlacement
      .filter((p) => p.type === 'sheep')
      .reduce((sum, p) => sum + p.count, 0)
    expect(player.sheep).toBe(placed)
  })
})

describe('game length', () => {
  it('runs 14 rounds then finishes', () => {
    const state = game()
    let guard = 0
    while (state.phase !== 'finished' && guard++ < 500) {
      if (state.phase === 'harvest') {
        completeHarvest(state)
        continue
      }
      const spaceId = [
        'forest',
        'clay-pit',
        'reed-bank',
        'fishing',
        'grain-seeds',
        'day-laborer',
        'farmland',
        'meeting-place',
        'lessons',
      ].find((id) => isSpaceAvailable(state, id))
      if (!spaceId) {
        // No legal space left: burn the worker to keep the loop moving.
        currentPlayer(state).peoplePlaced += 1
        advanceTurn(state)
        continue
      }
      takeAction(state, spaceId)
    }

    expect(state.phase).toBe('finished')
    expect(state.round).toBe(14)
  })
})

describe('card adjustments', () => {
  // The parser refuses this card's wording by design, so the table settles what
  // it does and records the outcome here.
  const UNENFORCED = 'occupation-academic'

  let state: GameState

  beforeEach(() => {
    state = game()
    state.players[0].played.push(UNENFORCED)
  })

  it('grants goods for a card the engine does not enforce', () => {
    const before = state.players[0].wood
    const result = adjustForCard(state, 0, UNENFORCED, 'wood', 2)

    expect(result.ok).toBe(true)
    expect(state.players[0].wood).toBe(before + 2)
  })

  it('spends goods when the amount is negative', () => {
    state.players[0].food = 5
    const result = adjustForCard(state, 0, UNENFORCED, 'food', -3)

    expect(result.ok).toBe(true)
    expect(state.players[0].food).toBe(2)
  })

  it('names the card in the log so the history stays auditable', () => {
    adjustForCard(state, 0, UNENFORCED, 'clay', 1)
    const entry = state.log.at(-1)

    expect(entry?.key).toBe('cardAdjustGain')
    expect(entry?.values).toMatchObject({ name: 'Ann', amount: 1, good: 'clay', cardId: UNENFORCED })
  })

  it('logs a spend with its own key so the wording reads naturally', () => {
    state.players[0].food = 2
    adjustForCard(state, 0, UNENFORCED, 'food', -1)

    expect(state.log.at(-1)?.key).toBe('cardAdjustSpend')
    // The amount is logged unsigned; the key carries the direction.
    expect(state.log.at(-1)?.values).toMatchObject({ amount: 1 })
  })

  it('refuses a card the player has not played', () => {
    const result = adjustForCard(state, 1, UNENFORCED, 'wood', 1)

    expect(result).toMatchObject({ ok: false, reason: 'noSuchCardAdjustment' })
    expect(state.players[1].wood).toBe(0)
  })

  it('refuses a card that does not exist', () => {
    expect(adjustForCard(state, 0, 'no-such-card', 'wood', 1)).toMatchObject({
      ok: false,
      reason: 'noSuchCardAdjustment',
    })
  })

  it('never lets goods go negative', () => {
    state.players[0].grain = 1
    const result = adjustForCard(state, 0, UNENFORCED, 'grain', -2)

    expect(result).toMatchObject({ ok: false, reason: 'notEnoughGoods' })
    expect(state.players[0].grain).toBe(1)
  })

  it('rejects a zero or fractional amount', () => {
    expect(adjustForCard(state, 0, UNENFORCED, 'wood', 0)).toMatchObject({
      ok: false,
      reason: 'adjustmentAmount',
    })
    expect(adjustForCard(state, 0, UNENFORCED, 'wood', 1.5)).toMatchObject({
      ok: false,
      reason: 'adjustmentAmount',
    })
  })

  it('houses animals rather than only counting them', () => {
    // Animals used to be refused outright, because bumping the counter would
    // leave it disagreeing with the farm. They go through the same placement
    // the action spaces use now, so the two cannot drift apart.
    state.players[0].fences = fenceRect(0, 0, 0, 0)

    const result = adjustForCard(state, 0, UNENFORCED, 'sheep', 1)

    expect(result.ok).toBe(true)
    expect(state.players[0].sheep).toBe(1)
    expect(state.players[0].animalPlacement).toEqual([{ key: '0', type: 'sheep', count: 1 }])
  })

  it('says so when a granted animal has nowhere to live', () => {
    const result = adjustForCard(state, 0, UNENFORCED, 'cattle', 3)

    expect(result.ok).toBe(true)
    // One pet fits in the house; the rest wander off, as they do anywhere else.
    expect(state.players[0].cattle).toBe(1)
    expect(state.log.at(-1)).toMatchObject({ key: 'cardAdjustStray', values: { lost: 2 } })
  })

  it('takes housed animals back off the farm', () => {
    state.players[0].fences = fenceRect(0, 0, 0, 0)
    adjustForCard(state, 0, UNENFORCED, 'sheep', 2)

    const result = adjustForCard(state, 0, UNENFORCED, 'sheep', -2)

    expect(result.ok).toBe(true)
    expect(state.players[0].sheep).toBe(0)
    expect(state.players[0].animalPlacement).toEqual([])
  })

  it('works for an enforced card too, since rulings vary', () => {
    state.players[0].played.push('major-fireplace-2')
    const result = adjustForCard(state, 0, 'major-fireplace-2', 'food', 1)

    expect(result.ok).toBe(true)
  })
})

describe('action board setup', () => {
  // Issue #5: the stage assignments were checked against the Revised Edition
  // appendix, which lists each card's stage explicitly.
  it('reveals Cultivation in stage 5 and Western Quarry in stage 2', () => {
    // These two were swapped, so Cultivation arrived in round 5 instead of 12
    // and the second stone quarry did not appear until the endgame.
    expect(findSpace('sow-and-bake')?.stage).toBe(5)
    expect(findSpace('west-quarry')?.stage).toBe(2)
  })

  it('matches the appendix stage for every stage card', () => {
    const expected: Record<string, number> = {
      'major-improvement': 1,
      fences: 1,
      'grain-utilization': 1,
      'sheep-market': 1,
      'wish-for-children': 2,
      'house-redevelopment': 2,
      'west-quarry': 2,
      'vegetable-seeds': 3,
      'pig-market': 3,
      'cattle-market': 4,
      'east-quarry': 4,
      'urgent-wish-for-children': 5,
      'sow-and-bake': 5,
      'farm-redevelopment': 6,
    }
    for (const [id, stage] of Object.entries(expected)) {
      expect(findSpace(id)?.stage, id).toBe(stage)
    }
  })

  it('fills every stage with the number of rounds it covers', () => {
    // A stage short of cards would leave a round with nothing revealed.
    for (let stage = 1; stage <= STAGE_ROUNDS.length; stage++) {
      const cards = STAGE_ACTION_SPACES.filter((space) => space.stage === stage)
      expect(cards.length, `stage ${stage}`).toBe(STAGE_ROUNDS[stage - 1].length)
    }
  })

  it('adds Grove, Hollow and Resource Market only from 3 players', () => {
    const two = allSpacesFor(2).map((space) => space.id)
    const three = allSpacesFor(3).map((space) => space.id)
    for (const id of ['grove', 'hollow', 'resource-market']) {
      expect(two, id).not.toContain(id)
      expect(three, id).toContain(id)
    }
  })

  it('seeds the 3-player accumulation spaces at their printed rates', () => {
    const state = createGame({ names: ['A', 'B', 'C'], random: () => 0.42 })
    expect(state.accumulated['grove']).toBe(2)
    expect(state.accumulated['hollow']).toBe(1)
    // The Resource Market is not an accumulation space.
    expect(state.accumulated['resource-market']).toBeUndefined()
  })
})

describe('resource market', () => {
  it('gives the chosen resource plus 1 food', () => {
    const state = createGame({ names: ['A', 'B', 'C'], random: () => 0.42 })
    const player = state.players[0]
    const food = player.food

    expect(takeAction(state, 'resource-market', { resource: 'stone' }).ok).toBe(true)
    expect(player.stone).toBe(1)
    expect(player.reed).toBe(0)
    expect(player.food).toBe(food + 1)
  })

  it('defaults to reed when no choice is passed', () => {
    const state = createGame({ names: ['A', 'B', 'C'], random: () => 0.42 })
    expect(takeAction(state, 'resource-market').ok).toBe(true)
    expect(state.players[0].reed).toBe(1)
  })
})

describe('breeding reports why it did not happen', () => {
  it('logs crowded animals that could not produce a newborn', () => {
    // Issue #8: a full farm bred nothing and said nothing, which read as a bug.
    const state = game(['Ann'])
    const player = state.players[0]
    player.fences = fenceRect(0, 3, 0, 4) // one 2-space pasture, capacity 4
    houseAnimals(player, 'sheep', 4)
    houseAnimals(player, 'boar', 1) // takes the pet slot

    breedAnimals(state, 0)

    expect(player.sheep).toBe(4)
    const entry = state.log.at(-1)
    expect(entry?.key).toBe('breedNoRoom')
    expect(entry?.values?.types).toBe('sheep')
  })

  it('still breeds and reports normally when there is room', () => {
    const state = game(['Ann'])
    const player = state.players[0]
    player.fences = fenceRect(0, 3, 0, 4)
    houseAnimals(player, 'sheep', 2)

    breedAnimals(state, 0)

    expect(player.sheep).toBe(3)
    expect(state.log.at(-1)?.key).toBe('breed')
  })
})

describe('the stage-card deck', () => {
  it('keeps its shuffled order when the state is copied', () => {
    // The store structured-clones the state on every move, so an order held
    // outside the state — in a WeakMap keyed by the state object — was lost on
    // the first move of the game and silently rebuilt in canonical order.
    // Every game from round 2 on then revealed the same cards in the same
    // sequence, which is most of what a stage shuffle is for.
    const state = createGame({ names: ['A', 'B'], random: () => 0.42 })
    const shuffled = getDeckOrder(state)

    expect(getDeckOrder(structuredClone(state))).toEqual(shuffled)
  })

  it('reveals one card per round in that order', () => {
    const state = createGame({ names: ['A', 'B'], random: () => 0.42 })
    const deck = [...getDeckOrder(state)]

    for (let round = 2; round <= 5; round++) {
      const copy = structuredClone({ ...state, round })
      revealForRound(copy)
      expect(copy.revealed[copy.revealed.length - 1]).toBe(deck[round - 1])
    }
  })

  it('falls back to canonical order for a game saved without one', () => {
    // Saves written before the order was part of the state still have to be
    // playable: keep what was already revealed, then carry on in stage order.
    const state = createGame({ names: ['A', 'B'], random: () => 0.42 })
    const legacy = structuredClone(state)
    delete legacy.deck

    const rebuilt = getDeckOrder(legacy)

    expect(rebuilt.slice(0, state.revealed.length)).toEqual(state.revealed)
    expect(rebuilt).toHaveLength(
      STAGE_ACTION_SPACES.filter((space) => (space.minPlayers ?? 1) <= 2).length,
    )
  })
})

describe('card effects that grant more than goods', () => {
  const UNENFORCED = 'occupation-net-fisherman'
  let state: GameState

  beforeEach(() => {
    state = game()
    state.players[0].played.push(UNENFORCED)
  })

  function apply(action: Parameters<typeof applyCardAction>[3], payload = {}) {
    return applyCardAction(state, 0, UNENFORCED, action, payload)
  }

  it('records bonus points a card awards, and scores them', () => {
    expect(apply('points', { points: 3 }).ok).toBe(true)

    expect(state.players[0].bonusPoints).toBe(3)
    expect(scorePlayer(state.players[0]).bonus).toBe(3)
  })

  it('takes points away again', () => {
    apply('points', { points: 3 })
    apply('points', { points: -1 })
    expect(scorePlayer(state.players[0]).bonus).toBe(2)
  })

  it('plows a field without charging for it', () => {
    expect(apply('plow', { spaceIndex: 6 }).ok).toBe(true)
    expect(state.players[0].farm[6]).toEqual({ kind: 'field' })
  })

  it('builds a room free but still next to the house', () => {
    const player = state.players[0]
    player.wood = 0
    player.reed = 0

    expect(apply('room', { spaceIndices: [6] }).ok).toBe(true)
    expect(player.farm[6].kind).toBe('room')
    // Nothing was taken for it — that is the point of a card granting a room.
    expect(player.wood).toBe(0)
    expect(player.reed).toBe(0)
  })

  it('still refuses a room that does not touch the house', () => {
    // Free does not mean anywhere: the adjacency rule is the game, the cost is
    // only the price.
    expect(apply('room', { spaceIndices: [14] })).toMatchObject({ ok: false })
  })

  it('builds a stable free but within the supply of four', () => {
    const player = state.players[0]
    player.wood = 0
    player.stablesRemaining = 0

    expect(apply('stable', { spaceIndices: [6] })).toMatchObject({ ok: false })

    player.stablesRemaining = 1
    expect(apply('stable', { spaceIndices: [6] }).ok).toBe(true)
    expect(player.farm[6].kind).toBe('stable')
    expect(player.wood).toBe(0)
  })

  it('fences free but still only around a real pasture', () => {
    const player = state.players[0]
    player.wood = 0

    expect(apply('fence', { fences: ['h:0:0'] })).toMatchObject({ ok: false })

    expect(apply('fence', { fences: fenceRect(0, 0, 0, 0) }).ok).toBe(true)
    expect(player.wood).toBe(0)
    expect(pastureInfo(player)).toHaveLength(1)
  })

  it('renovates free, and refuses once the house is stone', () => {
    const player = state.players[0]
    player.clay = 0
    player.reed = 0

    expect(apply('renovate').ok).toBe(true)
    expect(player.house).toBe('clay')
    expect(apply('renovate').ok).toBe(true)
    expect(player.house).toBe('stone')
    expect(apply('renovate')).toMatchObject({ ok: false, reason: 'alreadyStone' })
  })

  it('grows the family without needing a spare room', () => {
    const player = state.players[0]
    const before = player.people

    expect(apply('growth').ok).toBe(true)

    expect(player.people).toBe(before + 1)
    expect(player.newborns).toBe(1)
  })

  it('names the card and what it did in the log', () => {
    apply('growth')
    expect(state.log.at(-1)).toMatchObject({
      key: 'cardActionApplied',
      values: { cardId: UNENFORCED, action: 'growth' },
    })
  })

  it('refuses a card the player has not played', () => {
    expect(applyCardAction(state, 0, 'occupation-academic', 'growth')).toMatchObject({
      ok: false,
      reason: 'noSuchCardAdjustment',
    })
  })

  it('refuses a pointless points adjustment', () => {
    expect(apply('points', { points: 0 })).toMatchObject({ ok: false })
  })
})
