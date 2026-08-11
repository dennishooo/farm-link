import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionDialog } from './action-dialog'
import { fenceRect, renderInChinese, renderUI, testPlayer } from './test-utils'
import type { Player } from '@/game/types'

/** The farm space button for a 1-based space number. */
function space(number: number) {
  return screen.getByRole('button', { name: new RegExp(`^Space ${number}:`) })
}

function confirmButton() {
  return screen.getByRole('button', { name: 'Confirm' })
}

function open(spaceId: string, player: Player, onConfirm = vi.fn()) {
  return {
    onConfirm,
    rendered: renderUI(
      <ActionDialog spaceId={spaceId} player={player} onConfirm={onConfirm} onCancel={vi.fn()} />,
    ),
  }
}

/** Open straight into one mode, the way a card-granted build does. */
function openInMode(mode: 'plow' | 'room' | 'stable' | 'fence', player: Player) {
  return renderUI(
    <ActionDialog
      spaceId="farm-expansion"
      mode={mode}
      player={player}
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
    />,
  )
}

describe('cultivation', () => {
  /** Two sown-able fields, two grain, and room to plow. */
  function farmer(): Player {
    const player = testPlayer()
    player.farm[0] = { kind: 'field' }
    player.farm[1] = { kind: 'field' }
    player.grain = 2
    return player
  }

  it('offers both plowable spaces and sowable fields', async () => {
    // Issue #6: only the plow targets were selectable, so the "and/or sow"
    // half of the action could not be reached at all.
    const player = farmer()
    await open('sow-and-bake', player).rendered

    expect(space(1)).toBeEnabled() // a field — sow
    expect(space(2)).toBeEnabled()
    expect(space(3)).toBeEnabled() // empty and adjacent — plow
  })

  it('sows a field and reports the crop', async () => {
    const user = userEvent.setup()
    const { onConfirm, rendered } = open('sow-and-bake', farmer())
    await rendered

    await user.click(space(1))
    expect(screen.getByText(/Space 1: Grain/)).toBeInTheDocument()

    await user.click(confirmButton())
    expect(onConfirm).toHaveBeenCalledWith({
      spaceIndex: undefined,
      sow: [{ spaceIndex: 0, crop: 'grain' }],
    })
  })

  it('cycles a field through grain, vegetables and back to nothing', async () => {
    const user = userEvent.setup()
    await open('sow-and-bake', farmer()).rendered

    await user.click(space(1))
    expect(screen.getByText(/Space 1: Grain/)).toBeInTheDocument()

    await user.click(space(1))
    expect(screen.getByText(/Space 1: Veg/)).toBeInTheDocument()

    await user.click(space(1))
    expect(screen.queryByText(/Space 1:/)).not.toBeInTheDocument()
  })

  it('plows and sows in a single action', async () => {
    const user = userEvent.setup()
    const { onConfirm, rendered } = open('sow-and-bake', farmer())
    await rendered

    await user.click(space(3)) // empty space — plow
    await user.click(space(1)) // existing field — sow
    await user.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith({
      spaceIndex: 2,
      sow: [{ spaceIndex: 0, crop: 'grain' }],
    })
  })

  it('cannot confirm with nothing chosen', async () => {
    await open('sow-and-bake', farmer()).rendered
    expect(confirmButton()).toBeDisabled()
  })
})

describe('farm expansion', () => {
  it('disables both builds and explains why when nothing is affordable', async () => {
    // Issue #10: cost was only checked after choosing a space, so an
    // unaffordable build read as the board ignoring the tap.
    await open('farm-expansion', testPlayer()).rendered

    expect(screen.getByRole('button', { name: /Build rooms/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Build stables/ })).toBeDisabled()
    expect(screen.getByText(/Greyed-out options/)).toBeInTheDocument()
  })

  it('enables a build once its cost is met', async () => {
    const player = testPlayer()
    player.wood = 5
    player.reed = 2
    await open('farm-expansion', player).rendered

    expect(screen.getByRole('button', { name: /Build rooms/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Build stables/ })).toBeEnabled()
    expect(screen.queryByText(/Greyed-out options/)).not.toBeInTheDocument()
  })

  it('enables stables alone when only wood is available', async () => {
    const player = testPlayer()
    player.wood = 2
    await open('farm-expansion', player).rendered

    expect(screen.getByRole('button', { name: /Build rooms/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Build stables/ })).toBeEnabled()
  })

  it('disables stables when the supply of 4 is exhausted', async () => {
    const player = testPlayer()
    player.wood = 10
    player.stablesRemaining = 0
    await open('farm-expansion', player).rendered

    expect(screen.getByRole('button', { name: /Build stables/ })).toBeDisabled()
  })

  it('builds a stable on the chosen space', async () => {
    const user = userEvent.setup()
    const player = testPlayer()
    player.wood = 2
    const { onConfirm, rendered } = open('farm-expansion', player)
    await rendered

    await user.click(screen.getByRole('button', { name: /Build stables/ }))
    await user.click(space(1))
    await user.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith({ spaceIndices: [0], stables: true })
  })

  it('builds rooms next to the house', async () => {
    const user = userEvent.setup()
    const player = testPlayer()
    player.wood = 5
    player.reed = 2
    const { onConfirm, rendered } = open('farm-expansion', player)
    await rendered

    await user.click(screen.getByRole('button', { name: /Build rooms/ }))
    // Space 6 and 11 are the starting rooms, so 1 and 7 are adjacent.
    await user.click(space(1))
    await user.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith({ spaceIndices: [0] })
  })
})

describe('resource market', () => {
  it('offers reed or stone, each with food', async () => {
    await open('resource-market', testPlayer()).rendered

    expect(screen.getByRole('button', { name: '1 Reed + 1 food' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 Stone + 1 food' })).toBeInTheDocument()
  })

  it('confirms immediately with the chosen resource', async () => {
    const user = userEvent.setup()
    const { onConfirm, rendered } = open('resource-market', testPlayer())
    await rendered

    await user.click(screen.getByRole('button', { name: '1 Stone + 1 food' }))
    expect(onConfirm).toHaveBeenCalledWith({ resource: 'stone' })
  })
})

describe('plowing', () => {
  it('only offers spaces adjacent to an existing field', async () => {
    const player = testPlayer()
    player.farm[0] = { kind: 'field' }
    await open('farmland', player).rendered

    expect(space(2)).toBeEnabled() // adjacent
    expect(space(15)).toBeDisabled() // far corner
  })

  it('replaces the selection rather than accumulating', async () => {
    const user = userEvent.setup()
    const { onConfirm, rendered } = open('farmland', testPlayer())
    await rendered

    await user.click(space(1))
    await user.click(space(2))
    await user.click(confirmButton())

    // Farmland plows exactly one field.
    expect(onConfirm).toHaveBeenCalledWith({ spaceIndex: 1 })
  })

  it('deselects a space when it is tapped again', async () => {
    const user = userEvent.setup()
    await open('farmland', testPlayer()).rendered

    await user.click(space(1))
    expect(confirmButton()).toBeEnabled()

    await user.click(space(1))
    expect(confirmButton()).toBeDisabled()
  })
})

describe('fencing', () => {
  it('refuses fences that enclose nothing', async () => {
    // Issue #2: dangling fences were paid for as long as the same action also
    // closed a legal pasture.
    const user = userEvent.setup()
    await open('fences', testPlayer()).rendered

    // h:0:0 runs along the top of the farmyard, so it borders one space only.
    await user.click(screen.getByRole('button', { name: 'Fence above space 1' }))

    expect(screen.getByText(/enclose nothing/)).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  it('accepts a closed pasture and reports how many it makes', async () => {
    const user = userEvent.setup()
    const { onConfirm, rendered } = open('fences', testPlayer())
    await rendered

    // The four edges around space 4, named the way a player would say them.
    for (const name of [
      'Fence above space 4',
      'Fence between space 4 and space 9',
      'Fence between space 3 and space 4',
      'Fence between space 4 and space 5',
    ]) {
      await user.click(screen.getByRole('button', { name }))
    }

    expect(screen.getByText(/Encloses 1 pasture/)).toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()

    await user.click(confirmButton())
    expect(onConfirm).toHaveBeenCalledWith({ fences: fenceRect(0, 3, 0, 3) })
  })

  it('shows the running wood cost against what the player holds', async () => {
    const user = userEvent.setup()
    const player = testPlayer()
    player.wood = 7
    await open('fences', player).rendered

    await user.click(screen.getByRole('button', { name: 'Fence above space 1' }))
    expect(screen.getByText(/1 fence\(s\) · 1 wood · you have 7/)).toBeInTheDocument()
  })
})

describe('simple actions', () => {
  it('asks only for confirmation when no input is needed', async () => {
    const user = userEvent.setup()
    const { onConfirm, rendered } = open('day-laborer', testPlayer())
    await rendered

    expect(screen.getByText('Confirm to take this action.')).toBeInTheDocument()
    await user.click(confirmButton())
    expect(onConfirm).toHaveBeenCalledWith({})
  })

  it('cancels without confirming', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    await renderUI(
      <ActionDialog
        spaceId="day-laborer"
        player={testPlayer()}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
    expect(onConfirm) .not.toHaveBeenCalled()
  })

  it('names the action space for screen readers', async () => {
    await open('farmland', testPlayer()).rendered
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Farmland')
    expect(within(dialog).getByRole('heading')).toHaveTextContent('Farmland')
  })
})

describe('in Traditional Chinese', () => {
  it('renders the expansion menu translated', async () => {
    const player = testPlayer()
    player.wood = 5
    player.reed = 2
    await renderInChinese(
      <ActionDialog
        spaceId="farm-expansion"
        player={player}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('你想建造什麼？')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /擴建房間/ })).toBeEnabled()
  })

  it('renders the resource market choices translated', async () => {
    await renderInChinese(
      <ActionDialog
        spaceId="resource-market"
        player={testPlayer()}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '1 蘆葦 + 1 食物' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 石頭 + 1 食物' })).toBeInTheDocument()
  })
})

describe('a farm with nowhere legal to put things', () => {
  /** Every space touching the house is a field, so no room may be added. */
  function boxedIn(): Player {
    const player = testPlayer()
    for (const index of [0, 1, 6, 11]) player.farm[index] = { kind: 'field' }
    return player
  }

  it('says so rather than opening on a dead board', async () => {
    // Every neighbour of the house is a field, so no room can legally be
    // built. The dialog used to open with nothing selectable, a dead Confirm
    // and no word about why.
    await openInMode('room', boxedIn())

    expect(screen.getByText(/nowhere on this farm that this can legally go/)).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  it('stays quiet when there is something to pick', async () => {
    await openInMode('room', testPlayer())

    expect(screen.queryByText(/nowhere on this farm/)).not.toBeInTheDocument()
  })

  it('says so when the fence supply has run out', async () => {
    const player = testPlayer()
    player.fencesRemaining = 0
    await open('fences', player).rendered

    expect(screen.getByText(/nowhere on this farm that this can legally go/)).toBeInTheDocument()
  })
})
