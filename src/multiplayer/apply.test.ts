import { describe, expect, it } from 'vitest'
import { createGame } from '../game/engine'
import type { GameState } from '../game/types'
import { applyIntent } from './apply'

function game(): GameState {
  return createGame({ names: ['Ann', 'Bo'], random: () => 0.42 })
}

/** A card the engine does not enforce, so its effect is applied by hand. */
const CARD = 'occupation-net-fisherman'

describe('turn ownership', () => {
  it('lets the current seat place a worker', () => {
    const state = game()
    const result = applyIntent(state, { kind: 'play', spaceId: 'forest' }, { seat: 0, isHost: true })
    expect(result.ok).toBe(true)
    expect(state.currentPlayerIndex).toBe(1)
  })

  it('rejects a play from a seat out of turn without touching the state', () => {
    const state = game()
    const result = applyIntent(
      state,
      { kind: 'play', spaceId: 'forest' },
      { seat: 1, isHost: false },
    )
    expect(result).toMatchObject({ ok: false, reason: 'notYourTurn' })
    expect(state.currentPlayerIndex).toBe(0)
    expect(state.occupied['forest']).toBeUndefined()
  })

  it('applies the same rule to passing a worker', () => {
    const state = game()
    expect(applyIntent(state, { kind: 'skipWorker' }, { seat: 1, isHost: false })).toMatchObject({
      ok: false,
      reason: 'notYourTurn',
    })
    expect(applyIntent(state, { kind: 'skipWorker' }, { seat: 0, isHost: true }).ok).toBe(true)
    expect(state.currentPlayerIndex).toBe(1)
  })
})

describe('farm ownership', () => {
  it('rejects rearranging someone else’s animals', () => {
    const state = game()
    const result = applyIntent(
      state,
      { kind: 'moveAnimals', playerIndex: 0, fromKey: 'house', toKey: 'house', count: 1 },
      { seat: 1, isHost: false },
    )
    expect(result).toMatchObject({ ok: false, reason: 'notYourFarm' })
  })

  it('rejects converting on someone else’s card', () => {
    const state = game()
    const result = applyIntent(
      state,
      { kind: 'convert', playerIndex: 1, cardId: 'fireplace', units: 1, good: 'sheep' },
      { seat: 0, isHost: true },
    )
    expect(result).toMatchObject({ ok: false, reason: 'notYourFarm' })
  })

  it('rejects adjusting someone else’s cards', () => {
    const state = game()
    const result = applyIntent(
      state,
      { kind: 'adjustForCard', playerIndex: 0, cardId: 'basket', good: 'food', delta: 1 },
      { seat: 1, isHost: false },
    )
    expect(result).toMatchObject({ ok: false, reason: 'notYourFarm' })
  })

  it('rejects playing a card effect on someone else’s farm', () => {
    const state = game()
    const result = applyIntent(
      state,
      { kind: 'cardAction', playerIndex: 0, cardId: CARD, action: 'points' },
      { seat: 1, isHost: false },
    )
    expect(result).toMatchObject({ ok: false, reason: 'notYourFarm' })
  })

  it('lets a seat play a card effect on its own farm', () => {
    const state = game()
    state.players[1].played.push(CARD)

    const result = applyIntent(
      state,
      { kind: 'cardAction', playerIndex: 1, cardId: CARD, action: 'points', payload: { points: 2 } },
      { seat: 1, isHost: false },
    )

    expect(result.ok).toBe(true)
    expect(state.players[1].bonusPoints).toBe(2)
  })
})

describe('transfers between farms', () => {
  /**
   * Either side of an exchange may hold the card, so both the giver and the
   * receiver are allowed to send the intent — but nobody else is.
   */
  it('lets the giving seat hand goods over', () => {
    const state = game()
    state.players[0].played.push(CARD)
    state.players[0].food = 3

    const result = applyIntent(
      state,
      { kind: 'transfer', fromIndex: 0, toIndex: 1, cardId: CARD, good: 'food', amount: 2 },
      { seat: 0, isHost: true },
    )

    expect(result.ok).toBe(true)
    expect(state.players[0].food).toBe(1)
  })

  it('lets the receiving seat buy from another farm', () => {
    const state = game()
    // The buyer holds the card ("you may buy their grain"), so seat 1 sends it.
    state.players[1].played.push(CARD)
    state.players[0].grain = 2

    const result = applyIntent(
      state,
      { kind: 'transfer', fromIndex: 0, toIndex: 1, cardId: CARD, good: 'grain', amount: 1 },
      { seat: 1, isHost: false },
    )

    expect(result.ok).toBe(true)
    expect(state.players[1].grain).toBe(1)
  })

  it('rejects a bystander moving other people’s goods', () => {
    const state = createGame({ names: ['Ann', 'Bo', 'Cy'], random: () => 0.42 })
    state.players[0].played.push(CARD)
    state.players[0].food = 3

    const result = applyIntent(
      state,
      { kind: 'transfer', fromIndex: 0, toIndex: 1, cardId: CARD, good: 'food', amount: 2 },
      { seat: 2, isHost: false },
    )

    expect(result).toMatchObject({ ok: false, reason: 'notYourFarm' })
    expect(state.players[0].food).toBe(3)
  })
})

describe('harvest', () => {
  function harvestGame(): GameState {
    const state = game()
    state.phase = 'harvest'
    state.round = 4
    state.harvest = { stage: 'field', playerIndex: 0 }
    // Enough food that nobody begs, so the harvest resolves quietly.
    for (const player of state.players) player.food = 10
    return state
  }

  it('only the host resolves it', () => {
    const state = harvestGame()
    expect(applyIntent(state, { kind: 'resolveHarvest' }, { seat: 1, isHost: false })).toMatchObject(
      { ok: false, reason: 'hostOnly' },
    )
    expect(state.phase).toBe('harvest')

    expect(applyIntent(state, { kind: 'resolveHarvest' }, { seat: 0, isHost: true }).ok).toBe(true)
    expect(state.phase).not.toBe('harvest')
  })

  it('refuses to resolve outside the harvest phase', () => {
    const state = game()
    expect(applyIntent(state, { kind: 'resolveHarvest' }, { seat: 0, isHost: true })).toMatchObject(
      { ok: false, reason: 'notHarvestPhase' },
    )
  })
})
