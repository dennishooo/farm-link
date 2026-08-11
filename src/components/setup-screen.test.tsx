import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupScreen } from './setup-screen'
import { renderInChinese, renderUI } from './test-utils'
import { useSessionStore } from '@/stores/session'

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

describe('online mode', () => {
  const originalSession = useSessionStore.getState()
  afterEach(() => useSessionStore.setState(originalSession, true))

  async function openOnlineTab() {
    const user = userEvent.setup()
    await renderUI(<SetupScreen onStart={vi.fn()} />)
    await user.click(screen.getByRole('tab', { name: 'Play online' }))
    return user
  }

  it('keeps the single-device flow as the default tab', async () => {
    await renderUI(<SetupScreen onStart={vi.fn()} />)
    expect(startButton()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create a room' })).not.toBeInTheDocument()
  })

  it('requires a name before creating a room', async () => {
    const createRoom = vi.fn()
    useSessionStore.setState({ createRoom })
    const user = await openOnlineTab()

    const create = screen.getByRole('button', { name: 'Create a room' })
    expect(create).toBeDisabled()

    await user.type(screen.getAllByRole('textbox')[0], 'Ann')
    await user.click(create)
    expect(createRoom).toHaveBeenCalledWith('Ann')
  })

  it('requires a full room code before joining', async () => {
    const joinRoom = vi.fn()
    useSessionStore.setState({ joinRoom })
    const user = await openOnlineTab()

    await user.type(screen.getAllByRole('textbox')[0], 'Bo')
    const join = screen.getByRole('button', { name: 'Join room' })
    expect(join).toBeDisabled()

    const codeInput = screen.getAllByRole('textbox')[1]
    await user.type(codeInput, 'wxyz')
    expect(codeInput).toHaveValue('WXYZ')

    await user.click(join)
    expect(joinRoom).toHaveBeenCalledWith('WXYZ', 'Bo')
  })

  it('shows a session error inside the online panel', async () => {
    useSessionStore.setState({ error: { key: 'roomFull' } })
    await openOnlineTab()
    expect(screen.getByRole('alert')).toHaveTextContent('That room is already full.')
  })

  it('announces an ended room and clears it on acknowledge', async () => {
    useSessionStore.setState({ status: 'ended', endedReason: 'host' })
    const user = userEvent.setup()
    await renderUI(<SetupScreen onStart={vi.fn()} />)

    expect(screen.getByText('The host ended the game.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to setup' }))
    expect(useSessionStore.getState().status).toBe('idle')
  })
})
