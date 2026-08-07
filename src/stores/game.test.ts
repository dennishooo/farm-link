import { beforeEach, describe, expect, it } from 'vitest'
import { HISTORY_LIMIT, useGameStore } from './game'
import type { LogEntry } from '@/game/types'

/** The entry just written — every revert appends exactly one. */
function last(log: LogEntry[]): LogEntry {
  return log[log.length - 1]
}

function reset() {
  localStorage.clear()
  useGameStore.setState({ game: null, error: null, history: [] })
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

  it('moves animals between housing slots', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])

    // Two 1x1 pastures, one sheep in the first.
    const game = useGameStore.getState().game!
    game.players[0].fences = [
      'h:0:0', 'h:1:0', 'v:0:0', 'v:0:1',
      'h:0:2', 'h:1:2', 'v:0:2', 'v:0:3',
    ]
    game.players[0].animalPlacement = [{ key: '0', type: 'sheep', count: 1 }]
    game.players[0].sheep = 1
    useGameStore.setState({ game: { ...game } })

    useGameStore.getState().moveAnimals(0, '0', '2', 1)

    const after = useGameStore.getState().game!.players[0]
    expect(after.animalPlacement).toEqual([{ key: '2', type: 'sheep', count: 1 }])
    expect(after.sheep).toBe(1)
    expect(useGameStore.getState().error).toBeNull()
  })

  it('surfaces a translatable error for an illegal move', () => {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])
    useGameStore.getState().moveAnimals(0, 'nowhere', 'pet', 1)
    expect(useGameStore.getState().error).toMatchObject({ key: 'invalidMove' })
  })

  it('abandons the game and clears the board', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().abandon()
    expect(useGameStore.getState().game).toBeNull()
  })
})

describe('card adjustments through the store', () => {
  beforeEach(reset)

  function startWithCard() {
    const { startGame } = useGameStore.getState()
    startGame(['Ann', 'Bo'])
    useGameStore.setState((state) => {
      const game = structuredClone(state.game!)
      game.players[0].played.push('occupation-academic')
      return { game }
    })
  }

  it('applies a card effect the engine cannot enforce', () => {
    startWithCard()
    const before = useGameStore.getState().game!.players[0].wood

    useGameStore.getState().adjustForCard(0, 'occupation-academic', 'wood', 2)

    const state = useGameStore.getState()
    expect(state.game!.players[0].wood).toBe(before + 2)
    expect(state.error).toBeNull()
  })

  it('surfaces a translatable error rather than mutating', () => {
    startWithCard()

    useGameStore.getState().adjustForCard(0, 'occupation-academic', 'grain', -5)

    const state = useGameStore.getState()
    expect(state.error?.key).toBe('notEnoughGoods')
    expect(state.game!.players[0].grain).toBe(0)
  })
})

describe('actions with no game in progress', () => {
  beforeEach(reset)

  it('ignore every call rather than throwing', () => {
    // The UI only renders these once a game exists, but a stale callback or a
    // rehydration race must not crash the app.
    const store = useGameStore.getState()

    expect(() => {
      store.play('forest')
      store.resolveHarvest()
      store.skipWorker()
      store.convert(0, 'major-clay-oven', 1, 'grain')
      store.adjustForCard(0, 'major-clay-oven', 'wood', 1)
      store.moveAnimals(0, 'pet', '3,4', 1)
    }).not.toThrow()

    expect(useGameStore.getState().game).toBeNull()
    expect(useGameStore.getState().error).toBeNull()
  })
})

describe('converting goods', () => {
  beforeEach(reset)

  it('turns a good into food through a played card', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.setState((state) => {
      const game = structuredClone(state.game!)
      game.players[0].played.push('major-clay-oven')
      game.players[0].grain = 1
      return { game }
    })

    useGameStore.getState().convert(0, 'major-clay-oven', 1, 'grain')

    const player = useGameStore.getState().game!.players[0]
    expect(player.grain).toBe(0)
    expect(player.food).toBe(7) // 2 starting + 5 from the oven
  })

  it('reports a conversion the player cannot make', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.setState((state) => {
      const game = structuredClone(state.game!)
      game.players[0].played.push('major-clay-oven')
      return { game }
    })

    useGameStore.getState().convert(0, 'major-clay-oven', 1, 'grain')

    expect(useGameStore.getState().error?.key).toBe('notEnoughToConvert')
  })

  it('refuses a card the player has not played', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().convert(0, 'major-clay-oven', 1, 'grain')

    expect(useGameStore.getState().error?.key).toBe('noSuchConversion')
  })
})

describe('resolving the harvest', () => {
  beforeEach(reset)

  it('does nothing outside the harvest phase', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    const before = useGameStore.getState().game

    useGameStore.getState().resolveHarvest()

    expect(useGameStore.getState().game).toBe(before)
  })
})

describe('taking a move back', () => {
  beforeEach(reset)

  it('restores the board to before the move', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')
    expect(useGameStore.getState().game!.players[0].wood).toBe(3)

    useGameStore.getState().undo()

    const game = useGameStore.getState().game!
    expect(game.players[0].wood).toBe(0)
    expect(game.occupied).toEqual({})
    expect(game.currentPlayerIndex).toBe(0)
    expect(game.players[0].peoplePlaced).toBe(0)
  })

  it('writes the revert into the log without erasing what was taken back', () => {
    // The log is the only record that a shared device let someone quietly
    // rewind a turn, so it is append-only: rewinding the log too would hide
    // exactly the thing worth recording.
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')
    const played = useGameStore.getState().game!.log.length

    useGameStore.getState().undo()

    const log = useGameStore.getState().game!.log
    expect(log).toHaveLength(played + 1)
    expect(log.some((entry) => entry.key === 'takeGoods')).toBe(true)
    expect(log[log.length - 1]).toMatchObject({
      key: 'undo',
      values: { name: 'Ann', space: 'forest' },
    })
  })

  it('names the space each move was taken on, one move at a time', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')
    useGameStore.getState().play('clay-pit')

    useGameStore.getState().undo()
    expect(last(useGameStore.getState().game!.log)).toMatchObject({
      key: 'undo',
      values: { name: 'Bo', space: 'clay-pit' },
    })

    useGameStore.getState().undo()
    expect(last(useGameStore.getState().game!.log)).toMatchObject({
      key: 'undo',
      values: { name: 'Ann', space: 'forest' },
    })
    expect(useGameStore.getState().game!.occupied).toEqual({})
  })

  it('does nothing when there is no move to take back', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    const before = useGameStore.getState().game

    useGameStore.getState().undo()

    expect(useGameStore.getState().game).toBe(before)
  })

  it('remembers nothing from an action the engine refused', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')
    useGameStore.getState().play('forest')
    expect(useGameStore.getState().error).not.toBeNull()

    expect(useGameStore.getState().history).toHaveLength(1)
  })

  it('records passing a worker as its own kind of revert', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().skipWorker()

    useGameStore.getState().undo()

    expect(useGameStore.getState().game!.players[0].peoplePlaced).toBe(0)
    expect(last(useGameStore.getState().game!.log)).toMatchObject({
      key: 'undoPass',
      values: { name: 'Ann' },
    })
  })

  it('takes back an anytime action, naming the card', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    const game = useGameStore.getState().game!
    game.players[0].played = ['major-clay-oven']
    game.players[0].grain = 1
    useGameStore.setState({ game: { ...game } })

    useGameStore.getState().convert(0, 'major-clay-oven', 1, 'grain')
    expect(useGameStore.getState().game!.players[0].grain).toBe(0)

    useGameStore.getState().undo()

    expect(useGameStore.getState().game!.players[0].grain).toBe(1)
    expect(last(useGameStore.getState().game!.log)).toMatchObject({
      key: 'undoCard',
      values: { name: 'Ann', cardId: 'major-clay-oven' },
    })
  })

  it('stamps the revert with the round play returns to', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    // Two people each, so the fourth placement ends the round. Undoing it has
    // to put the line in round 1, where play resumes, not round 2.
    for (const space of ['forest', 'clay-pit', 'reed-bank', 'fishing'] as const) {
      useGameStore.getState().play(space)
    }
    expect(useGameStore.getState().game!.round).toBe(2)

    useGameStore.getState().undo()

    const game = useGameStore.getState().game!
    expect(game.round).toBe(1)
    expect(last(game.log).round).toBe(1)
  })

  it('keeps only the last ten moves', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    // Passing is always legal while a worker remains, and each pass is one
    // move, so this is the cheapest way to overrun the limit.
    for (let move = 0; move < HISTORY_LIMIT + 4; move++) useGameStore.getState().skipWorker()

    expect(useGameStore.getState().history).toHaveLength(HISTORY_LIMIT)
  })

  it('forgets the previous game when a new one starts', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')

    useGameStore.getState().startGame(['Cy', 'Di'])

    expect(useGameStore.getState().history).toEqual([])
  })

  it('survives a reload, so the save and its undo stay together', () => {
    useGameStore.getState().startGame(['Ann', 'Bo'])
    useGameStore.getState().play('forest')

    const saved = JSON.parse(localStorage.getItem('farmlink-game')!)
    expect(saved.state.history).toHaveLength(1)
    expect(saved.state.history[0].entry).toMatchObject({ key: 'undo' })
  })
})
