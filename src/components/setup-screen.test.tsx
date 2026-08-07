import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupScreen } from './setup-screen'
import { renderInChinese, renderUI } from './test-utils'

function startButton() {
  return screen.getByRole('button', { name: 'Start game' })
}

describe('player count', () => {
  it('starts a two-player game by default', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    await renderUI(<SetupScreen onStart={onStart} />)

    await user.click(startButton())
    expect(onStart).toHaveBeenCalledWith(['Player 1', 'Player 2'])
  })

  it('offers one seat per chosen player count', async () => {
    const user = userEvent.setup()
    await renderUI(<SetupScreen onStart={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /^4/ }))
    expect(screen.getByText('Player 4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^2/ }))
    expect(screen.queryByText('Player 4')).not.toBeInTheDocument()
  })

  it('explains the solo rules only in a one-player game', async () => {
    const user = userEvent.setup()
    await renderUI(<SetupScreen onStart={vi.fn()} />)

    expect(screen.queryByText(/Solo game:/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^1/ }))
    expect(screen.getByText(/Solo game:/)).toBeInTheDocument()
  })
})

describe('player names', () => {
  it('uses a typed name and defaults the rest', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    await renderUI(<SetupScreen onStart={onStart} />)

    await user.type(screen.getAllByRole('textbox')[0], 'Ann')
    await user.click(startButton())

    expect(onStart).toHaveBeenCalledWith(['Ann', 'Player 2'])
  })

  it('falls back to the default when a name is only whitespace', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    await renderUI(<SetupScreen onStart={onStart} />)

    await user.type(screen.getAllByRole('textbox')[0], '   ')
    await user.click(startButton())

    expect(onStart).toHaveBeenCalledWith(['Player 1', 'Player 2'])
  })

  it('keeps names when the player count changes', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    await renderUI(<SetupScreen onStart={onStart} />)

    await user.type(screen.getAllByRole('textbox')[0], 'Ann')
    await user.click(screen.getByRole('button', { name: /^3/ }))
    await user.click(startButton())

    expect(onStart).toHaveBeenCalledWith(['Ann', 'Player 2', 'Player 3'])
  })

  it('caps a name at 16 characters', async () => {
    await renderUI(<SetupScreen onStart={vi.fn()} />)
    expect(screen.getAllByRole('textbox')[0]).toHaveAttribute('maxLength', '16')
  })
})

describe('in Traditional Chinese', () => {
  it('defaults the seat names in Chinese', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    await renderInChinese(<SetupScreen onStart={onStart} />)

    await user.click(screen.getByRole('button', { name: '開始遊戲' }))
    expect(onStart).toHaveBeenCalledWith(['玩家 1', '玩家 2'])
  })
})
