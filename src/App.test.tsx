import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { renderUI } from '@/components/test-utils'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'
import { createGame } from '@/game/engine'
import type { GameState } from '@/game/types'

/**
 * These cover the wiring between the store, the board and the dialogs — the
 * seam that unit tests on either side cannot see.
 */

function reset() {
  localStorage.clear()
  useGameStore.setState({ game: null, error: null, history: [], future: [] })
}

/** Put a deterministic game into the store, optionally tweaked first. */
function loadGame(mutate?: (game: GameState) => void) {
  const game = createGame({ names: ['Ann', 'Bo'], random: () => 0.42 })
  mutate?.(game)
  useGameStore.setState({ game, error: null, history: [], future: [] })
  return game
}

describe('starting a game', () => {
  beforeEach(reset)

  it('shows the setup screen when there is no game', async () => {
    await renderUI(<App />)
    expect(screen.getByRole('button', { name: 'Start game' })).toBeInTheDocument()
  })

  it('starts a game and shows the board', async () => {
    const user = userEvent.setup()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: 'Start game' }))

    expect(screen.getByText('Round 1 of 14')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Forest/ })).toBeInTheDocument()
  })

  it('returns to setup when the game is abandoned', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: 'New game' }))
    expect(screen.getByRole('button', { name: 'Start game' })).toBeInTheDocument()
  })
})

describe('taking actions', () => {
  beforeEach(reset)

  it('resolves a simple action without a dialog', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Day Laborer/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useGameStore.getState().game?.players[0].food).toBe(4) // 2 + 2
  })

  it('opens a dialog for an action needing a choice', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Farmland/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('plows the chosen space and advances the turn', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Farmland/ }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^Space 1:/ }))
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    expect(useGameStore.getState().game?.players[0].farm[0].kind).toBe('field')
    expect(screen.getByText("Bo's turn")).toBeInTheDocument()
  })

  it('closes the dialog on cancel without acting', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Farmland/ }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText("Ann's turn")).toBeInTheDocument()
  })

  it('passes a worker without taking a space', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: 'Pass worker' }))
    expect(screen.getByText("Bo's turn")).toBeInTheDocument()
  })
})

describe('errors', () => {
  beforeEach(reset)

  it('shows an illegal action as an alert', async () => {
    const user = userEvent.setup()
    loadGame((game) => {
      game.accumulated['forest'] = 0
    })
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Forest/ }))

    expect(screen.getByRole('alert')).toHaveTextContent(/nothing/i)
    // The worker is not spent on a refused action.
    expect(screen.getByText("Ann's turn")).toBeInTheDocument()
  })

  it('clears the alert on the next successful action', async () => {
    const user = userEvent.setup()
    loadGame((game) => {
      game.accumulated['forest'] = 0
    })
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Forest/ }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Day Laborer/ }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('harvest', () => {
  beforeEach(reset)

  it('offers to resolve the harvest and then moves on', async () => {
    const user = userEvent.setup()
    loadGame((game) => {
      game.phase = 'harvest'
      game.round = 4
      game.harvest = { stage: 'field', playerIndex: 0 }
    })
    await renderUI(<App />)

    expect(screen.getByText('Harvest time')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Resolve harvest' }))

    expect(useGameStore.getState().game?.phase).not.toBe('harvest')
  })

  it('hides the pass-worker button during the harvest', async () => {
    loadGame((game) => {
      game.phase = 'harvest'
      game.harvest = { stage: 'field', playerIndex: 0 }
    })
    await renderUI(<App />)

    expect(screen.queryByRole('button', { name: 'Pass worker' })).not.toBeInTheDocument()
  })
})

describe('final scores', () => {
  beforeEach(reset)

  it('ranks the players when the game is over', async () => {
    loadGame((game) => {
      game.phase = 'finished'
      game.round = 14
      game.players[1].grain = 8 // put Bo clearly ahead
    })
    await renderUI(<App />)

    expect(screen.getByText('Final scores')).toBeInTheDocument()
    expect(screen.getByText('1. Bo')).toBeInTheDocument()
    expect(screen.getByText('2. Ann')).toBeInTheDocument()
  })

  it('stops offering actions once the game is finished', async () => {
    loadGame((game) => {
      game.phase = 'finished'
    })
    await renderUI(<App />)

    expect(screen.getByRole('button', { name: /Forest/ })).toBeDisabled()
  })
})

describe('game log', () => {
  beforeEach(reset)

  it('renders keyed entries as sentences', async () => {
    loadGame()
    await renderUI(<App />)

    expect(screen.getByText(/Round 1 begins/)).toBeInTheDocument()
  })

  it('retranslates the log when the language changes', async () => {
    // The engine stores keys, not sentences, precisely so this works.
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.selectOptions(screen.getByLabelText('Language'), 'zh-HK')
    expect(screen.getByText(/第 1 回合開始/)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('語言'), 'en')
  })
})

describe('online play', () => {
  const originalSession = useSessionStore.getState()

  beforeEach(reset)
  afterEach(() => useSessionStore.setState(originalSession, true))

  /** Put a server-broadcast game into the session store, seated as `seat`. */
  function loadOnline(seat: number, mutate?: (game: GameState) => void) {
    const game = createGame({ names: ['Ann', 'Bo'], random: () => 0.42 })
    mutate?.(game)
    useSessionStore.setState({
      status: 'playing',
      game,
      seat,
      code: 'ABCD',
      players: [
        { name: 'Ann', connected: true },
        { name: 'Bo', connected: true },
      ],
    })
    return game
  }

  it('shows the room code and your seat in the header', async () => {
    loadOnline(1)
    await renderUI(<App />)

    expect(screen.getByText(/Room ABCD/)).toBeInTheDocument()
    expect(screen.getByText(/You are Bo/)).toBeInTheDocument()
  })

  it('disables the board when it is not your turn', async () => {
    loadOnline(1) // seat 1, but it is Ann's (seat 0) turn
    await renderUI(<App />)

    expect(screen.getByRole('button', { name: /Forest/ })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Pass worker' })).not.toBeInTheDocument()
  })

  it('sends your action as an intent instead of mutating locally', async () => {
    const user = userEvent.setup()
    const sendIntent = vi.fn()
    loadOnline(0)
    useSessionStore.setState({ sendIntent })
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Day Laborer/ }))

    expect(sendIntent).toHaveBeenCalledWith({ kind: 'play', spaceId: 'day-laborer', payload: undefined })
    expect(useGameStore.getState().game).toBeNull()
  })

  it('offers End game to the host and Leave game to a guest', async () => {
    loadOnline(0)
    const { unmount } = await renderUI(<App />)
    expect(screen.getByRole('button', { name: 'End game' })).toBeInTheDocument()
    unmount()

    loadOnline(1)
    await renderUI(<App />)
    expect(screen.getByRole('button', { name: 'Leave game' })).toBeInTheDocument()
  })

  it('reserves the harvest button for the host', async () => {
    loadOnline(1, (game) => {
      game.phase = 'harvest'
      game.round = 4
      game.harvest = { stage: 'field', playerIndex: 0 }
    })
    await renderUI(<App />)

    expect(screen.queryByRole('button', { name: 'Resolve harvest' })).not.toBeInTheDocument()
    expect(
      screen.getByText('The host resolves the harvest once everyone is ready.'),
    ).toBeInTheDocument()
  })

  it('shows the lobby while waiting for the host to start', async () => {
    useSessionStore.setState({
      status: 'lobby',
      code: 'ABCD',
      seat: 1,
      players: [
        { name: 'Ann', connected: true },
        { name: 'Bo', connected: true },
      ],
    })
    await renderUI(<App />)

    expect(screen.getByText('Room ABCD')).toBeInTheDocument()
    expect(screen.getByText('Waiting for the host to start the game…')).toBeInTheDocument()
  })
})

describe('taking a move back', () => {
  beforeEach(reset)

  it('offers nothing to undo until a move has been made', async () => {
    loadGame()
    await renderUI(<App />)

    expect(screen.queryByRole('button', { name: /Undo/ })).not.toBeInTheDocument()
  })

  it('reverts the move and says so in the log', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Forest/ }))
    expect(screen.getByRole('button', { name: /Forest/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Undo/ }))

    // The space is free again, and the board is back on Ann's turn.
    expect(screen.getByRole('button', { name: /Forest/ })).toBeEnabled()
    expect(screen.getByText("Ann's turn")).toBeInTheDocument()
    expect(screen.getByText(/Ann takes back their move on Forest/)).toBeInTheDocument()
    // What was taken back stays on the record.
    expect(screen.getByText(/Ann takes 3 Wood/)).toBeInTheDocument()
  })

  it('stops offering undo once the history runs out', async () => {
    const user = userEvent.setup()
    loadGame()
    await renderUI(<App />)

    await user.click(screen.getByRole('button', { name: /Forest/ }))
    await user.click(screen.getByRole('button', { name: /Undo/ }))

    expect(screen.queryByRole('button', { name: /Undo/ })).not.toBeInTheDocument()
  })
})

describe('applying card effects that are not goods', () => {
  beforeEach(reset)

  /** A game where Ann has played a card the engine does not enforce. */
  function withManualCard() {
    return loadGame((game) => {
      game.players[0].played.push('occupation-net-fisherman')
    })
  }

  async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    const panels = screen.getAllByText('Apply a card effect')
    await user.click(panels[0])
  }

  it('applies an effect that needs no target straight away', async () => {
    const user = userEvent.setup()
    withManualCard()
    await renderUI(<App />)
    await openPanel(user)

    await user.click(screen.getByRole('button', { name: 'Family growth' }))

    expect(useGameStore.getState().game!.players[0].people).toBe(3)
    expect(screen.getByText(/applies Net Fisherman: Family growth/)).toBeInTheDocument()
  })

  it('asks where to put an effect that lands on the farm', async () => {
    const user = userEvent.setup()
    withManualCard()
    await renderUI(<App />)
    await openPanel(user)

    await user.click(screen.getByRole('button', { name: 'Plow a field' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading')).toHaveTextContent('Plow a field')

    await user.click(within(dialog).getByRole('button', { name: /^Space 7:/ }))
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    expect(useGameStore.getState().game!.players[0].farm[6]).toEqual({ kind: 'field' })
  })

  it('records bonus points against the score', async () => {
    const user = userEvent.setup()
    withManualCard()
    await renderUI(<App />)
    await openPanel(user)

    await user.click(screen.getByRole('button', { name: '+ 1 pts' }))

    expect(useGameStore.getState().game!.players[0].bonusPoints).toBe(1)
  })

  it('can be taken back like any other move', async () => {
    const user = userEvent.setup()
    withManualCard()
    await renderUI(<App />)
    await openPanel(user)

    await user.click(screen.getByRole('button', { name: 'Family growth' }))
    await user.click(screen.getByRole('button', { name: /Undo/ }))

    expect(useGameStore.getState().game!.players[0].people).toBe(2)
  })
})

describe('card effects between players', () => {
  beforeEach(reset)

  it('gives goods to the chosen player and writes it down', async () => {
    const user = userEvent.setup()
    loadGame((game) => {
      game.players[0].played.push('occupation-net-fisherman')
      game.players[0].wood = 3
    })
    await renderUI(<App />)

    await user.click(screen.getAllByText('Apply a card effect')[0])
    await user.selectOptions(screen.getByLabelText('Good'), 'wood')
    await user.selectOptions(screen.getByLabelText('Amount'), '2')
    await user.click(screen.getByRole('button', { name: 'Give' }))

    const players = useGameStore.getState().game!.players
    expect(players[0].wood).toBe(1)
    expect(players[1].wood).toBe(2)
    expect(screen.getByText(/Ann gives 2 Wood to Bo for Net Fisherman/)).toBeInTheDocument()
  })

  it('offers no one to give to in a solo game', async () => {
    const user = userEvent.setup()
    const game = createGame({ names: ['Solo'], random: () => 0.42 })
    game.players[0].played.push('occupation-net-fisherman')
    useGameStore.setState({ game, error: null, history: [], future: [] })
    await renderUI(<App />)

    await user.click(screen.getAllByText('Apply a card effect')[0])

    expect(screen.queryByRole('button', { name: 'Give' })).not.toBeInTheDocument()
  })
})
