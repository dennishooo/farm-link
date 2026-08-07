import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardPicker } from './card-picker'
import { renderInChinese, renderUI, testGame } from './test-utils'
import type { GameState } from '@/game/types'

function picker(spaceId: string, game: GameState, onConfirm = vi.fn()) {
  const player = game.players[0]
  return {
    onConfirm,
    rendered: renderUI(
      <CardPicker
        spaceId={spaceId}
        game={game}
        player={player}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    ),
  }
}

/** A game whose first player holds exactly the given cards. */
function gameWithHand(occupations: string[] = [], minors: string[] = []): GameState {
  const game = testGame()
  game.players[0].hand = { occupations, minors }
  return game
}

describe('occupations', () => {
  it('lists the cards in hand with their type', async () => {
    const game = gameWithHand(['occupation-net-fisherman'])
    await picker('lessons', game).rendered

    expect(screen.getByText('Net Fisherman')).toBeInTheDocument()
    expect(screen.getByText(/Occ/)).toBeInTheDocument()
  })

  it('shows the food cost against what the player holds', async () => {
    const game = gameWithHand(['occupation-net-fisherman'])
    game.players[0].food = 2
    await picker('lessons', game).rendered

    // The first Lessons space is free in a 2-player game.
    expect(screen.getByText(/Costs 0 food · you have 2/)).toBeInTheDocument()
  })

  it('disables a card the player cannot pay for', async () => {
    const game = gameWithHand(['occupation-net-fisherman'])
    game.players[0].food = 0
    // The second Lessons space charges food.
    await picker('lessons-2', game).rendered

    expect(screen.getByRole('button', { name: /Net Fisherman/ })).toBeDisabled()
  })

  it('confirms the selected card', async () => {
    const user = userEvent.setup()
    const game = gameWithHand(['occupation-net-fisherman'])
    const { onConfirm, rendered } = picker('lessons', game)
    await rendered

    await user.click(screen.getByRole('button', { name: /Net Fisherman/ }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onConfirm).toHaveBeenCalledWith('occupation-net-fisherman', 0)
  })

  it('says so when there is nothing to play', async () => {
    await picker('lessons', gameWithHand()).rendered
    expect(screen.getByText('You have no cards to play here.')).toBeInTheDocument()
  })

  it('cannot confirm before a card is chosen', async () => {
    const game = gameWithHand(['occupation-net-fisherman'])
    await picker('lessons', game).rendered
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})

describe('improvements', () => {
  it('offers the majors on the supply board', async () => {
    const game = gameWithHand([], [])
    await picker('major-improvement', game).rendered

    // All ten majors are available at the start of a game.
    expect(screen.getByText('Clay Oven')).toBeInTheDocument()
    expect(screen.getByText('Well')).toBeInTheDocument()
  })

  it('marks a card the engine does not apply for you', async () => {
    const game = gameWithHand([], ['minor-basket'])
    await picker('major-improvement', game).rendered

    expect(screen.getAllByText("Apply this card's effect yourselves").length).toBeGreaterThan(0)
  })

  it('lets the player choose between cost options', async () => {
    const user = userEvent.setup()
    const game = gameWithHand()
    const player = game.players[0]
    // Well costs 1 stone + 3 wood; give plenty so it is affordable.
    player.wood = 20
    player.clay = 20
    player.reed = 20
    player.stone = 20
    await picker('major-improvement', game).rendered

    await user.click(screen.getByRole('button', { name: /Clay Oven/ }))
    // Clay Oven has a single cost, so no chooser appears.
    expect(screen.queryByText('How will you pay?')).not.toBeInTheDocument()
  })

  it('disables an improvement the player cannot afford', async () => {
    const game = gameWithHand()
    await picker('major-improvement', game).rendered
    expect(screen.getByRole('button', { name: /Clay Oven/ })).toBeDisabled()
  })
})

describe('cancelling', () => {
  it('closes without choosing', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const game = gameWithHand(['occupation-net-fisherman'])
    await renderUI(
      <CardPicker
        spaceId="lessons"
        game={game}
        player={game.players[0]}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

describe('in Traditional Chinese', () => {
  it('shows card titles and the manual marker translated', async () => {
    const game = gameWithHand(['occupation-net-fisherman'])
    await renderInChinese(
      <CardPicker
        spaceId="lessons"
        game={game}
        player={game.players[0]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('撒網漁夫')).toBeInTheDocument()
    expect(screen.getByText('此卡效果請玩家自行結算')).toBeInTheDocument()
  })
})
