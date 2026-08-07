import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './game'

function reset() {
  localStorage.clear()
  useGameStore.setState({ game: null, error: null })
}

describe('game store', () => {
  beforeEach(reset)

  it('starts with no game', () => {
    expect(useGameStore.getState().game).toBeNull()
  })

  it('creates a game and keeps the action functions callable', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])

    const state = useGameStore.getState()
    expect(state.game?.players).toHaveLength(2)
    // Regression: rehydration once replaced the store and dropped these.
    expect(typeof state.play).toBe('function')
    expect(typeof state.resolveHarvest).toBe('function')
  })

  it('produces a new state object so React re-renders', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])
    const before = useGameStore.getState().game

    useGameStore.getState().play('forest')
    const after = useGameStore.getState().game

    expect(after).not.toBe(before)
    expect(after?.players[0].wood).toBe(3)
  })

  it('surfaces an error instead of mutating on an illegal action', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')
    const snapshot = useGameStore.getState().game

    useGameStore.getState().play('forest')
    expect(useGameStore.getState().error).toMatchObject({ key: 'spaceUnavailable' })
    expect(useGameStore.getState().game).toBe(snapshot)
  })

  it('clears the error on the next successful action', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')
    useGameStore.getState().play('forest')
    expect(useGameStore.getState().error).not.toBeNull()

    useGameStore.getState().play('clay-pit')
    expect(useGameStore.getState().error).toBeNull()
  })

  it('passes a worker without taking an action space', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])
    useGameStore.getState().skipWorker()

    const game = useGameStore.getState().game!
    expect(game.players[0].peoplePlaced).toBe(1)
    expect(game.occupied).toEqual({})
    expect(game.currentPlayerIndex).toBe(1)
  })

  it('persists the game to localStorage for offline reloads', () => {
    useGameStore.getState().startGame(['Ann'])
    const saved = localStorage.getItem('farmlink-game')
    expect(saved).toBeTruthy()
    expect(JSON.parse(saved!).state.game.players[0].name).toBe('Ann')
  })

  it('abandons the game and clears the board', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().abandon()
    expect(useGameStore.getState().game).toBeNull()
  })
})
