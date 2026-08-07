import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { affordableOptions, cardById, canAfford } from '@/game/cards'
import { occupationCost } from '@/game/engine'
import { cn } from '@/lib/utils'
import type { Card } from '@/game/cards/types'
import type { ActionSpaceId, GameState, Player } from '@/game/types'

type CardPickerProps = {
  spaceId: ActionSpaceId
  game: GameState
  player: Player
  onConfirm: (cardId: string, costOption: number) => void
  onCancel: () => void
}

/** Format a cost option as "3 wood + 1 reed", or "free". */
function describeCost(option: Record<string, number | undefined>): string {
  const parts = Object.entries(option)
    .filter(([, amount]) => amount)
    .map(([good, amount]) => `${amount} ${good}`)
  return parts.length ? parts.join(' + ') : 'free'
}

export function CardPicker({ spaceId, game, player, onConfirm, onCancel }: CardPickerProps) {
  const isOccupation = spaceId === 'lessons' || spaceId === 'lessons-2'

  const cards = useMemo(() => {
    const ids = isOccupation
      ? player.hand.occupations
      : [...player.hand.minors, ...game.majorsAvailable]
    return ids.map(cardById).filter((card): card is Card => card !== undefined)
  }, [isOccupation, player.hand, game.majorsAvailable])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [costIndex, setCostIndex] = useState(0)

  const selected = selectedId ? cardById(selectedId) : null
  const options = selected ? affordableOptions(player, selected) : []

  const occupationsPlayed = player.played.filter(
    (id) => cardById(id)?.type === 'occupation',
  ).length
  const foodCost = occupationCost(game.players.length, spaceId, occupationsPlayed)

  const playable = (card: Card) =>
    isOccupation ? player.food >= foodCost : canAfford(player, card)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isOccupation ? 'Play an occupation' : 'Build an improvement'}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center"
    >
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-bold">
            {isOccupation ? 'Play an occupation' : 'Build an improvement'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isOccupation
              ? `Costs ${foodCost} food · you have ${player.food}`
              : `${cards.length} available`}
          </p>
        </div>

        <ul className="flex-1 overflow-auto p-3">
          {cards.length === 0 && (
            <li className="p-4 text-center text-sm text-muted-foreground">
              You have no cards to play here.
            </li>
          )}
          {cards.map((card) => {
            const isSelected = card.id === selectedId
            const affordable = playable(card)

            return (
              <li key={card.id}>
                <button
                  onClick={() => {
                    setSelectedId(card.id)
                    setCostIndex(0)
                  }}
                  disabled={!affordable}
                  className={cn(
                    'mb-2 w-full rounded-md border p-3 text-left transition-colors',
                    isSelected ? 'border-primary bg-accent' : 'border-border',
                    !affordable && 'opacity-45',
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-bold">{card.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {card.type === 'major' ? 'Major' : card.type === 'minor' ? 'Minor' : 'Occ'}
                      {card.points !== 0 && ` · ${card.points} pt`}
                    </span>
                  </span>
                  {card.cost.length > 0 && (
                    <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">
                      {card.cost.map(describeCost).join('  or  ')}
                    </span>
                  )}
                  <span className="mt-1 block text-xs text-muted-foreground">{card.text}</span>
                  {!card.enforced && (
                    <span className="mt-1 block text-[11px] font-semibold text-primary">
                      Apply this card's effect yourselves
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {selected && options.length > 1 && (
          <div className="border-t border-border px-3 py-2">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">How will you pay?</p>
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={index === costIndex ? 'default' : 'outline'}
                  onClick={() => setCostIndex(index)}
                >
                  {describeCost(option)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 border-t border-border p-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected.id, costIndex)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
