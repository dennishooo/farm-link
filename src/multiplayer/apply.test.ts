import { describe, expect, it } from 'vitest'
import { createGame } from '../game/engine'
import type { GameState } from '../game/types'
import { applyIntent } from './apply'

function game(): GameState {
  return createGame({ names: ['Ann', 'Bo'], random: () => 0.42 })
}

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
