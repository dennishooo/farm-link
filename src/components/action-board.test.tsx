import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionBoard } from './action-board'
import { fenceRect, renderInChinese, renderUI, testGame } from './test-utils'
import { houseAnimals } from '@/game/farm'
import type { GameState } from '@/game/types'

function board(game: GameState, onChoose = vi.fn(), disabled = false) {
  return { onChoose, rendered: renderUI(<ActionBoard game={game} onChoose={onChoose} disabled={disabled} />) }
}

/** A game whose current player has a full pasture and an occupied pet slot. */
function crowdedGame(): GameState {
  const game = testGame()
  const player = game.players[game.currentPlayerIndex]
  player.fences = fenceRect(0, 3, 0, 4)
  houseAnimals(player, 'sheep', 4)
  houseAnimals(player, 'boar', 1)
  game.accumulated['sheep-market'] = 1
  game.revealed = [...new Set([...game.revealed, 'sheep-market'])]
  return game
}

describe('animal capacity warning', () => {
  it('warns before the action that animals would wander off', async () => {
    // Issue #9: animals with nowhere to live are lost (rulebook p.7), but the
    // only sign of it was a line in the collapsed log afterwards.
    await board(crowdedGame()).rendered
    expect(screen.getByText(/1 would wander off/)).toBeInTheDocument()
  })

  it('stays quiet when the farm has room', async () => {
    const game = testGame()
    const player = game.players[game.currentPlayerIndex]
    player.fences = fenceRect(0, 3, 0, 4)
    houseAnimals(player, 'sheep', 1)
    game.accumulated['sheep-market'] = 1
    game.revealed = [...new Set([...game.revealed, 'sheep-market'])]
    await board(game).rendered

    expect(screen.queryByText(/wander off/)).not.toBeInTheDocument()
  })

  it('never warns about building resources', async () => {
    const game = testGame()
    game.accumulated['forest'] = 3
    await board(game).rendered

    expect(screen.queryByText(/wander off/)).not.toBeInTheDocument()
  })

  it('follows the current player, not the first', async () => {
    const game = crowdedGame()
    // Hand the turn to a player with an empty farm.
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
    await board(game).rendered

    expect(screen.queryByText(/wander off/)).not.toBeInTheDocument()
  })

  it('warns in Traditional Chinese too', async () => {
    await renderInChinese(<ActionBoard game={crowdedGame()} onChoose={vi.fn()} />)
    expect(screen.getByText(/1 隻走失/)).toBeInTheDocument()
  })
})

describe('spaces by player count', () => {
  it('hides the 3-player spaces in a two-player game', async () => {
    await board(testGame(['Ann', 'Bo'])).rendered

    expect(screen.queryByRole('button', { name: /Grove/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Hollow/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Resource Market/ })).not.toBeInTheDocument()
  })

  it('shows them from three players', async () => {
    // Issue #5: all three were missing from the board entirely.
    await board(testGame(['Ann', 'Bo', 'Cal'])).rendered

    expect(screen.getByRole('button', { name: /Grove/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hollow/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Resource Market/ })).toBeInTheDocument()
  })

  it('adds Traveling Players only at four', async () => {
    await board(testGame(['Ann', 'Bo', 'Cal'])).rendered
    expect(screen.queryByRole('button', { name: /Traveling Players/ })).not.toBeInTheDocument()
  })

  it('hides stage cards until they are revealed', async () => {
    const game = testGame()
    game.revealed = []
    await board(game).rendered

    expect(screen.queryByRole('button', { name: /Sheep Market/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Forest/ })).toBeInTheDocument()
  })
})

describe('choosing a space', () => {
  it('reports the chosen space id', async () => {
    const user = userEvent.setup()
    const { onChoose, rendered } = board(testGame())
    await rendered

    await user.click(screen.getByRole('button', { name: /Forest/ }))
    expect(onChoose).toHaveBeenCalledWith('forest')
  })

  it('disables a space another player has taken', async () => {
    const game = testGame()
    game.occupied['forest'] = game.players[1].id
    await board(game).rendered

    expect(screen.getByRole('button', { name: /Forest/ })).toBeDisabled()
    expect(screen.getByText(/Taken by Bo/)).toBeInTheDocument()
  })

  it('disables every space when the board is disabled', async () => {
    await board(testGame(), vi.fn(), true).rendered
    expect(screen.getByRole('button', { name: /Forest/ })).toBeDisabled()
  })
})

describe('accumulated goods', () => {
  it('shows the amount waiting on a space', async () => {
    const game = testGame()
    game.accumulated['forest'] = 6
    await board(game).rendered

    expect(screen.getByRole('button', { name: /Forest/ })).toHaveTextContent('6')
  })

  it('shows the per-round rate the engine actually pays', async () => {
    // Issue #1: the displayed rate has to come from the engine's own helper so
    // it cannot drift from what is paid out.
    await board(testGame()).rendered
    expect(screen.getByRole('button', { name: /Forest/ })).toHaveTextContent(
      '+3 Wood each round',
    )
  })

  it('halves the Forest rate in a solo game', async () => {
    await board(testGame(['Solo'])).rendered
    expect(screen.getByRole('button', { name: /Forest/ })).toHaveTextContent(
      '+2 Wood each round',
    )
  })
})
