import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cardById } from '@/game/cards'
import {
  ADJUSTABLE_GOODS,
  CARD_ACTIONS,
  type AdjustableGood,
  type CardAction,
  type CardActionPayload,
} from '@/game/engine'
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
  /** The other players at the table, for card effects that move goods. */
  opponents?: { index: number; name: string }[]
  onTransfer?: (
    fromIndex: number,
    toIndex: number,
    cardId: string,
    good: AdjustableGood,
    amount: number,
  ) => void
  /** Everything a card can grant that is not a good. */
  onCardAction?: (
    playerIndex: number,
    cardId: string,
    action: CardAction,
    payload?: CardActionPayload,
  ) => void
}

/** Written out so Tailwind and the translator both see every key. */
const ACTION_LABEL: Record<CardAction, string> = {
  points: 'cards.actionPoints',
  plow: 'cards.actionPlow',
  room: 'cards.actionRoom',
  stable: 'cards.actionStable',
  fence: 'cards.actionFence',
  renovate: 'cards.actionRenovate',
  growth: 'cards.actionGrowth',
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
export function AdjustPanel({
  player,
  playerIndex,
  onAdjust,
  onCardAction,
  opponents = [],
  onTransfer,
}: AdjustPanelProps) {
  const { t, i18n } = useTranslation()
  const [cardId, setCardId] = useState('')
  const [good, setGood] = useState<AdjustableGood>('food')
  const [amount, setAmount] = useState(1)
  const [target, setTarget] = useState<number | null>(null)

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

          <p className="eyebrow text-[10px] text-muted-foreground">{t('cards.adjustGoods')}</p>

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

          {onTransfer && opponents.length > 0 && (
            <>
              <p className="eyebrow text-[10px] text-muted-foreground">{t('cards.adjustGive')}</p>
              <div className="flex gap-1.5">
                <select
                  aria-label={t('cards.adjustTarget')}
                  value={target ?? opponents[0].index}
                  onChange={(event) => setTarget(Number(event.target.value))}
                  className={SELECT_CLASS}
                >
                  {opponents.map((opponent) => (
                    <option key={opponent.index} value={opponent.index}>
                      {opponent.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selectedId || player[good] < amount}
                  onClick={() =>
                    onTransfer(
                      playerIndex,
                      target ?? opponents[0].index,
                      selectedId,
                      good,
                      amount,
                    )
                  }
                  className="h-7 flex-1 text-[11px]"
                >
                  {t('cards.give')}
                </Button>
              </div>
            </>
          )}

          {onCardAction && (
            <>
              <p className="eyebrow text-[10px] text-muted-foreground">
                {t('cards.adjustPoints')}
              </p>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selectedId}
                  onClick={() => onCardAction(playerIndex, selectedId, 'points', { points: amount })}
                  className="h-7 flex-1 text-[11px]"
                >
                  + {t('game.points', { count: amount })}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!selectedId}
                  onClick={() =>
                    onCardAction(playerIndex, selectedId, 'points', { points: -amount })
                  }
                  className="h-7 flex-1 text-[11px]"
                >
                  − {t('game.points', { count: amount })}
                </Button>
              </div>

              <p className="eyebrow text-[10px] text-muted-foreground">{t('cards.adjustFarm')}</p>
              <ul className="grid grid-cols-2 gap-1.5">
                {CARD_ACTIONS.filter((action) => action !== 'points').map((action) => (
                  <li key={action}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!selectedId}
                      onClick={() => onCardAction(playerIndex, selectedId, action)}
                      className="h-7 w-full text-[11px]"
                    >
                      {t(ACTION_LABEL[action] as 'cards.actionPlow')}
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] leading-snug text-muted-foreground">
                {t('cards.actionFree')}
              </p>
            </>
          )}
        </div>
      )}
    </details>
  )
}
