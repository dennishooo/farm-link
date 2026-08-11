import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { affordableOptions, cardById, canAfford } from '@/game/cards'
import { occupationCost } from '@/game/engine'
import { cn } from '@/lib/utils'
import { localiseCard } from '@/lib/i18n/format'
import type { Card } from '@/game/cards/types'
import type { ActionSpaceId, GameState, Player } from '@/game/types'

type CardPickerProps = {
  spaceId: ActionSpaceId
  game: GameState
  player: Player
  onConfirm: (cardId: string, costOption: number) => void
  onCancel: () => void
}

/** Spelled out per type so Tailwind can see the classes it has to generate. */
function stripeForType(type: Card['type']): string {
  if (type === 'major') return 'border-l-stone'
  if (type === 'minor') return 'border-l-reed'
  return 'border-l-clay'
}

export function CardPicker({ spaceId, game, player, onConfirm, onCancel }: CardPickerProps) {
  const { t, i18n } = useTranslation()

  /** Format a cost option as "3 wood + 1 reed", or "free". */
  const describeCost = (option: Record<string, number | undefined>): string => {
    const parts = Object.entries(option)
      .filter(([, amount]) => amount)
      .map(([good, amount]) => `${amount} ${t(`goods.${good}` as 'goods.wood')}`)
    return parts.length ? parts.join(' + ') : t('cards.free')
  }

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
      aria-label={isOccupation ? t('cards.playOccupation') : t('cards.buildImprovement')}
      className="animate-[var(--animate-fade-in)] fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center"
    >
      <div className="animate-[var(--animate-sheet-in)] surface-panel flex max-h-[88vh] w-full max-w-lg flex-col rounded-xl border border-border shadow-[var(--shadow-float)]">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-bold">
            {isOccupation ? t('cards.playOccupation') : t('cards.buildImprovement')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isOccupation
              ? t('cards.occupationCost', { cost: foodCost, food: player.food })
              : t('cards.available', { count: cards.length })}
          </p>
        </div>

        <ul className="flex-1 overflow-auto p-3">
          {cards.length === 0 && (
            <li className="p-4 text-center text-sm text-muted-foreground">{t('cards.none')}</li>
          )}
          {cards.map((card) => {
            const isSelected = card.id === selectedId
            const affordable = playable(card)

            const localised = localiseCard(card, i18n.language)

            return (
              <li key={card.id}>
                <button
                  onClick={() => {
                    setSelectedId(card.id)
                    setCostIndex(0)
                  }}
                  disabled={!affordable}
                  className={cn(
                    'mb-2 w-full rounded-lg border border-l-4 bg-card p-3 text-left',
                    'shadow-[var(--shadow-tile)] transition-[transform,box-shadow,border-color,background-color]',
                    // A stripe in the deck's own colour: occupations, minor
                    // improvements and majors are three different piles on the
                    // table and should not look like one scrolling list.
                    stripeForType(card.type),
                    isSelected
                      ? 'border-primary bg-accent shadow-[var(--shadow-raised)]'
                      : 'hover:-translate-y-px hover:border-primary/40 hover:shadow-[var(--shadow-raised)]',
                    !affordable && 'opacity-45 shadow-none hover:translate-y-0',
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-bold">{localised.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {card.type === 'major'
                        ? t('cards.typeMajor')
                        : card.type === 'minor'
                          ? t('cards.typeMinor')
                          : t('cards.typeOccupation')}
                      {card.points !== 0 &&
                        ` · ${t('cards.pointsShort', { count: card.points })}`}
                    </span>
                  </span>
                  {card.cost.length > 0 && (
                    <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">
                      {card.cost.map(describeCost).join(`  ${t('cards.or')}  `)}
                    </span>
                  )}
                  <span className="mt-1 block text-xs text-muted-foreground">{localised.text}</span>
                  {!localised.translated && (
                    <span className="mt-1 block text-[11px] text-muted-foreground italic">
                      {t('cards.translationPending')}
                    </span>
                  )}
                  {!card.enforced && (
                    <span className="mt-1 block text-[11px] font-semibold text-primary">
                      {t('cards.manualEffect')}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {selected && options.length > 1 && (
          <div className="border-t border-border px-3 py-2">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">{t('cards.howToPay')}</p>
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
            {t('dialog.cancel')}
          </Button>
          <Button
            className="flex-1"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected.id, costIndex)}
          >
            {t('dialog.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
