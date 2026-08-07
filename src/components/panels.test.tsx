import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnimalPanel } from './animal-panel'
import { AdjustPanel } from './adjust-panel'
import { ConvertPanel } from './convert-panel'
import { fenceRect, renderInChinese, renderUI, testPlayer } from './test-utils'
import { houseAnimals } from '@/game/farm'
import type { Player } from '@/game/types'

/** A farm with one 2-space pasture (capacity 4) holding sheep. */
function withSheep(count = 2): Player {
  const player = testPlayer()
  player.fences = fenceRect(0, 3, 0, 4)
  houseAnimals(player, 'sheep', count)
  return player
}

describe('AnimalPanel', () => {
  it('only offers slots that hold animals as a source', async () => {
    await renderUI(<AnimalPanel player={withSheep()} playerIndex={0} onMove={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Pasture 4,5/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /House/ })).toBeDisabled()
  })

  it('moves an animal to the chosen destination', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    await renderUI(<AnimalPanel player={withSheep()} playerIndex={0} onMove={onMove} />)

    await user.click(screen.getByRole('button', { name: /Pasture 4,5/ }))
    await user.click(screen.getByRole('button', { name: /House/ }))

    expect(onMove).toHaveBeenCalledWith(0, '3,4', 'pet', 1)
  })

  it('switches the prompt once a source is picked', async () => {
    const user = userEvent.setup()
    await renderUI(<AnimalPanel player={withSheep()} playerIndex={0} onMove={vi.fn()} />)

    expect(screen.getByText('Move animals')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Pasture 4,5/ }))
    expect(screen.getByText('Choose where to move them')).toBeInTheDocument()
  })

  it('abandons the move when the source is tapped again', async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    await renderUI(<AnimalPanel player={withSheep()} playerIndex={0} onMove={onMove} />)

    const source = screen.getByRole('button', { name: /Pasture 4,5/ })
    await user.click(source)
    await user.click(source)

    expect(screen.getByText('Move animals')).toBeInTheDocument()
    expect(onMove).not.toHaveBeenCalled()
  })

  it('shows how full each slot is', async () => {
    await renderUI(<AnimalPanel player={withSheep(3)} playerIndex={0} onMove={vi.fn()} />)
    expect(screen.getByRole('button', { name: /3\/4/ })).toBeInTheDocument()
  })

  it('reports an empty slot with its capacity', async () => {
    await renderUI(<AnimalPanel player={withSheep()} playerIndex={0} onMove={vi.fn()} />)
    expect(screen.getByRole('button', { name: /empty · holds 1/ })).toBeInTheDocument()
  })
})

describe('AdjustPanel', () => {
  function played(cardId: string): Player {
    const player = testPlayer()
    player.played = [cardId]
    return player
  }

  it('invites the player to play a card first when they hold none', async () => {
    const user = userEvent.setup()
    await renderUI(<AdjustPanel player={testPlayer()} playerIndex={0} onAdjust={vi.fn()} />)

    await user.click(screen.getByText('Apply a card effect'))
    expect(screen.getByText(/Play a card first/)).toBeInTheDocument()
  })

  it('grants the chosen good', async () => {
    const user = userEvent.setup()
    const onAdjust = vi.fn()
    await renderUI(
      <AdjustPanel player={played('occupation-net-fisherman')} playerIndex={0} onAdjust={onAdjust} />,
    )

    await user.click(screen.getByText('Apply a card effect'))
    await user.selectOptions(screen.getByLabelText('Good'), 'wood')
    await user.selectOptions(screen.getByLabelText('Amount'), '3')
    await user.click(screen.getByRole('button', { name: /Gain/ }))

    expect(onAdjust).toHaveBeenCalledWith(0, 'occupation-net-fisherman', 'wood', 3)
  })

  it('spends as a negative amount', async () => {
    const user = userEvent.setup()
    const onAdjust = vi.fn()
    const player = played('occupation-net-fisherman')
    player.food = 5
    await renderUI(<AdjustPanel player={player} playerIndex={0} onAdjust={onAdjust} />)

    await user.click(screen.getByText('Apply a card effect'))
    await user.click(screen.getByRole('button', { name: /Spend/ }))

    expect(onAdjust).toHaveBeenCalledWith(0, 'occupation-net-fisherman', 'food', -1)
  })

  it('will not let a player spend what they do not have', async () => {
    const user = userEvent.setup()
    const player = played('occupation-net-fisherman')
    player.food = 0
    await renderUI(<AdjustPanel player={player} playerIndex={0} onAdjust={vi.fn()} />)

    await user.click(screen.getByText('Apply a card effect'))
    expect(screen.getByRole('button', { name: /Spend/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Gain/ })).toBeEnabled()
  })

  it('offers livestock too, since 40 unenforced cards hand out animals', async () => {
    const user = userEvent.setup()
    await renderUI(
      <AdjustPanel player={played('occupation-net-fisherman')} playerIndex={0} onAdjust={vi.fn()} />,
    )

    await user.click(screen.getByText('Apply a card effect'))
    const options = [...screen.getByLabelText<HTMLSelectElement>('Good').options].map((o) => o.value)
    expect(options).toEqual([
      'wood',
      'clay',
      'reed',
      'stone',
      'grain',
      'vegetable',
      'food',
      'sheep',
      'boar',
      'cattle',
    ])
  })

  it('lists every played card to attribute the effect to', async () => {
    const user = userEvent.setup()
    const player = testPlayer()
    player.played = ['occupation-net-fisherman', 'major-clay-oven']
    await renderUI(<AdjustPanel player={player} playerIndex={0} onAdjust={vi.fn()} />)

    await user.click(screen.getByText('Apply a card effect'))
    const options = [...screen.getByLabelText<HTMLSelectElement>('Card').options].map((o) => o.text)
    expect(options).toEqual(['Net Fisherman', 'Clay Oven'])
  })

  it('renders in Traditional Chinese', async () => {
    const user = userEvent.setup()
    await renderInChinese(
      <AdjustPanel player={played('major-clay-oven')} playerIndex={0} onAdjust={vi.fn()} />,
    )

    await user.click(screen.getByText('結算卡牌效果'))
    expect(screen.getByLabelText('物資')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /獲得/ })).toBeInTheDocument()
  })
})

describe('ConvertPanel', () => {
  function withOven(): Player {
    const player = testPlayer()
    player.played = ['major-clay-oven']
    return player
  }

  it('shows nothing when no played card exchanges goods', async () => {
    const { container } = await renderUI(
      <ConvertPanel player={testPlayer()} playerIndex={0} onConvert={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('offers the exchange a card provides', async () => {
    await renderUI(<ConvertPanel player={withOven()} playerIndex={0} onConvert={vi.fn()} />)
    expect(screen.getByText('Exchange for food')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1 Grain → 5 food/ })).toBeInTheDocument()
  })

  it('disables an exchange the player cannot make', async () => {
    await renderUI(<ConvertPanel player={withOven()} playerIndex={0} onConvert={vi.fn()} />)
    // No grain in supply.
    expect(screen.getByRole('button', { name: /1 Grain → 5 food/ })).toBeDisabled()
  })

  it('converts the good the button names', async () => {
    // Regression: every button on a multi-rate card exchanged the first listed
    // good, so most of them silently did nothing.
    const user = userEvent.setup()
    const onConvert = vi.fn()
    const player = withOven()
    player.grain = 1
    await renderUI(<ConvertPanel player={player} playerIndex={0} onConvert={onConvert} />)

    await user.click(screen.getByRole('button', { name: /1 Grain → 5 food/ }))
    expect(onConvert).toHaveBeenCalledWith(0, 'major-clay-oven', 1, 'grain')
  })

  it('offers a separate button per animal on a cooking hearth', async () => {
    const player = testPlayer()
    player.played = ['major-cooking-hearth']
    await renderUI(<ConvertPanel player={player} playerIndex={0} onConvert={vi.fn()} />)

    // Sheep, boar, cattle and vegetables each convert at their own rate.
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
  })
})
