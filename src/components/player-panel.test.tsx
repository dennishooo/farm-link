import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerPanel } from './player-panel'
import { fenceRect, renderInChinese, renderUI, testPlayer } from './test-utils'
import { houseAnimals } from '@/game/farm'
import type { Player } from '@/game/types'

function panel(player: Player, props: Record<string, unknown> = {}) {
  return renderUI(<PlayerPanel player={player} playerIndex={0} isCurrent={false} {...props} />)
}

describe('played cards', () => {
  it('shows the rules text without needing a hover', async () => {
    // Issue #3: the text lived only in a `title` tooltip, which never appears
    // on a touch screen — on a phone the effect could not be read at all.
    const user = userEvent.setup()
    const player = testPlayer()
    player.played = ['occupation-net-fisherman']
    await panel(player)

    const summary = screen.getByText(/Net Fisherman/)
    await user.click(summary)

    expect(screen.getByText(/take all the Food markers/)).toBeInTheDocument()
  })

  it('marks cards the engine does not apply for you', async () => {
    // Issue #4: "no effect" was the engine correctly declining to guess at
    // wording it cannot parse, but nothing said so.
    const player = testPlayer()
    player.played = ['occupation-net-fisherman']
    await panel(player)

    expect(screen.getByText(/apply yourselves/)).toBeInTheDocument()
  })

  it('does not mark a card the engine enforces', async () => {
    const player = testPlayer()
    player.played = ['major-fireplace-2']
    await panel(player)

    expect(screen.queryByText(/apply yourselves/)).not.toBeInTheDocument()
  })

  it('shows a card that is worth points', async () => {
    const player = testPlayer()
    player.played = ['major-clay-oven']
    await panel(player)

    // The points sit inside the card's own summary, not the score breakdown,
    // which also mentions points.
    const summary = screen.getByText(/Clay Oven/).closest('summary')
    expect(summary).toHaveTextContent('Clay Oven')
    expect(summary).toHaveTextContent('2 pt')
  })

  it('renders a card in Traditional Chinese', async () => {
    const player = testPlayer()
    player.played = ['major-clay-oven']
    await renderInChinese(<PlayerPanel player={player} playerIndex={0} isCurrent={false} />)

    expect(screen.getByText(/黏土烤爐/)).toBeInTheDocument()
  })
})

describe('live score', () => {
  it('shows a running total during play', async () => {
    // Issue #7: the score existed but was only shown once the game ended.
    await panel(testPlayer())
    expect(screen.getByText(/Score so far:/)).toBeInTheDocument()
  })

  it('keeps the breakdown collapsed until asked for', async () => {
    const user = userEvent.setup()
    await panel(testPlayer())

    expect(screen.queryByText('Begging markers')).not.toBeVisible()
    await user.click(screen.getByText(/Score so far:/))
    expect(screen.getByText('Begging markers')).toBeVisible()
  })

  it('shows the final breakdown open, without the running-total summary', async () => {
    await panel(testPlayer(), { showScore: true })

    expect(screen.queryByText(/Score so far:/)).not.toBeInTheDocument()
    expect(screen.getByText('Begging markers')).toBeVisible()
  })

  it('counts begging markers against the total', async () => {
    const player = testPlayer()
    player.beggingMarkers = 2
    await panel(player, { showScore: true })

    // -3 points each, per the rulebook.
    expect(screen.getByText('-6')).toBeInTheDocument()
  })

  it('shows workers remaining while playing but not after scoring', async () => {
    await panel(testPlayer())
    expect(screen.getByText(/2 left/)).toBeInTheDocument()
  })
})

describe('panels shown only during play', () => {
  it('hides the action panels on the final scores screen', async () => {
    const player = testPlayer()
    player.played = ['major-fireplace-2']
    await panel(player, { showScore: true, onConvert: vi.fn(), onAdjustForCard: vi.fn() })

    expect(screen.queryByText('Apply a card effect')).not.toBeInTheDocument()
    expect(screen.queryByText('Exchange for food')).not.toBeInTheDocument()
  })

  it('shows them while the game is running', async () => {
    const player = testPlayer()
    player.played = ['major-fireplace-2']
    await panel(player, { onConvert: vi.fn(), onAdjustForCard: vi.fn() })

    expect(screen.getByText('Apply a card effect')).toBeInTheDocument()
    expect(screen.getByText('Exchange for food')).toBeInTheDocument()
  })

  it('omits a panel whose handler is not supplied', async () => {
    await panel(testPlayer())
    expect(screen.queryByText('Apply a card effect')).not.toBeInTheDocument()
  })
})

describe('turn marker', () => {
  it('marks the player who is to act', async () => {
    await panel(testPlayer(), { isCurrent: true })
    expect(screen.getByText('To act')).toBeInTheDocument()
  })

  it('leaves other players unmarked', async () => {
    await panel(testPlayer())
    expect(screen.queryByText('To act')).not.toBeInTheDocument()
  })
})

describe('labels for anyone not looking at the icons', () => {
  it('names each resource pile, not only in a hover tooltip', async () => {
    // Same trap as the card rules text in issue #3: a `title` is the whole
    // label, and a touch screen never shows one. The icon carries the meaning
    // visually; this is what everything else has to read.
    const player = testPlayer()
    player.wood = 5
    await panel(player)

    expect(screen.getByTitle('Wood')).toHaveTextContent('Wood: 5')
  })

  it('names an empty pile too', async () => {
    await panel(testPlayer())
    expect(screen.getByTitle('Cattle')).toHaveTextContent('Cattle: 0')
  })

  it('says what is grazing in a pasture', async () => {
    // The herd is drawn as a glyph and a number, and a tile's own label
    // overrides anything inside it, so the animals have to be named there.
    const player = testPlayer()
    player.fences = fenceRect(0, 3, 0, 4)
    houseAnimals(player, 'sheep', 2)
    await panel(player)

    expect(screen.getByRole('button', { name: 'Space 4: empty, 2 Sheep' })).toBeInTheDocument()
    // The pasture's other space is not a second herd.
    expect(screen.getByRole('button', { name: 'Space 5: empty' })).toBeInTheDocument()
  })
})
