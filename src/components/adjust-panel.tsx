import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cardById } from '@/game/cards'
import { ADJUSTABLE_GOODS, type AdjustableGood } from '@/game/engine'
import { localiseCard } from '@/lib/i18n/format'
import type { Player } from '@/game/types'

type AdjustPanelProps = {
  player: Player
  playerIndex: number
  onAdjust: (
    playerIndex: number,
    cardId: string,
    good: AdjustableGood,
    delta: number,
  ) => void
}

const AMOUNTS = [1, 2, 3, 4, 5] as const

const SELECT_CLASS =
  'h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-1.5 text-[11px]'

/**
 * Record the effect of a card the engine does not enforce.
 *
 * Two thirds of the deck state their effect in prose the parser refuses to
 * interpret, so without this those cards can be read but never acted on. The
 * table agrees what the card does; this writes the result into the game and
 * names the card in the log.
 */
export function AdjustPanel({ player, playerIndex, onAdjust }: AdjustPanelProps) {
  const { t, i18n } = useTranslation()
  const [cardId, setCardId] = useState('')
  const [good, setGood] = useState<AdjustableGood>('food')
  const [amount, setAmount] = useState(1)

  const cards = player.played.map(cardById).filter((card) => card !== undefined)

  // Cards can be played mid-session, so fall back to the first one rather than
  // holding a stale id from before this player had any.
  const selectedId = cards.some((card) => card.id === cardId) ? cardId : (cards[0]?.id ?? '')

  return (
    <details className="border-t border-border pt-2">
      <summary className="eyebrow cursor-pointer text-[10px] text-muted-foreground">
        {t('cards.adjust')}
      </summary>

      {cards.length === 0 ? (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{t('cards.adjustNoCards')}</p>
      ) : (
        <div className="mt-1.5 flex flex-col gap-1.5">
          <p className="text-[11px] leading-snug text-muted-foreground">{t('cards.adjustHint')}</p>

          <div className="flex gap-1.5">
            <select
              aria-label={t('cards.adjustCard')}
              value={selectedId}
              onChange={(event) => setCardId(event.target.value)}
              className={SELECT_CLASS}
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {localiseCard(card, i18n.language).title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5">
            <select
              aria-label={t('cards.adjustGood')}
              value={good}
              onChange={(event) => setGood(event.target.value as AdjustableGood)}
              className={SELECT_CLASS}
            >
              {ADJUSTABLE_GOODS.map((option) => (
                <option key={option} value={option}>
                  {t(`goods.${option}` as 'goods.wood')}
                </option>
              ))}
            </select>

            <select
              aria-label={t('cards.adjustAmount')}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className={SELECT_CLASS}
            >
              {AMOUNTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedId}
              onClick={() => onAdjust(playerIndex, selectedId, good, amount)}
              className="h-7 flex-1 text-[11px]"
            >
              + {t('cards.adjustGain')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedId || player[good] < amount}
              onClick={() => onAdjust(playerIndex, selectedId, good, -amount)}
              className="h-7 flex-1 text-[11px]"
            >
              − {t('cards.adjustSpend')}
            </Button>
          </div>
        </div>
      )}
    </details>
  )
}
