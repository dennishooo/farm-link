import { useTranslation } from 'react-i18next'
import { Farmyard } from '@/components/farmyard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cardById } from '@/game/cards'
import { workersLeft } from '@/game/engine'
import { scorePlayer } from '@/game/scoring'
import { cn } from '@/lib/utils'
import { localiseCard } from '@/lib/i18n/format'
import { ConvertPanel } from '@/components/convert-panel'
import { AnimalPanel } from '@/components/animal-panel'
import { AdjustPanel } from '@/components/adjust-panel'
import { GoodIcon, PersonIcon, type GoodIconName } from '@/components/ui/icons'
import type { Player } from '@/game/types'
import type { Payable } from '@/game/cards/types'
import type { AdjustableGood, CardAction, CardActionPayload } from '@/game/engine'

/**
 * The supply, in the order the goods appear on the player board: building
 * materials, then crops, then food, then livestock. Each carries its own tint
 * so a chip can be found by colour before its number is read.
 */
const GOODS: { key: GoodIconName & keyof Player; tint: string }[] = [
  { key: 'wood', tint: 'text-wood' },
  { key: 'clay', tint: 'text-clay' },
  { key: 'reed', tint: 'text-reed' },
  { key: 'stone', tint: 'text-stone' },
  { key: 'grain', tint: 'text-grain' },
  { key: 'vegetable', tint: 'text-vegetable' },
  { key: 'food', tint: 'text-food' },
  { key: 'sheep', tint: 'text-sheep' },
  { key: 'boar', tint: 'text-boar' },
  { key: 'cattle', tint: 'text-cattle' },
]

/** Written out in full so Tailwind can see each class in the source. */
const PLAYER_ACCENT = ['text-player-1', 'text-player-2', 'text-player-3', 'text-player-4']

type PlayerPanelProps = {
  player: Player
  playerIndex: number
  isCurrent: boolean
  showScore?: boolean
  onConvert?: (playerIndex: number, cardId: string, units: number, good: Payable) => void
  onMoveAnimals?: (playerIndex: number, fromKey: string, toKey: string, count: number) => void
  onAdjustForCard?: (
    playerIndex: number,
    cardId: string,
    good: AdjustableGood,
    delta: number,
  ) => void
  onCardAction?: (
    playerIndex: number,
    cardId: string,
    action: CardAction,
    payload?: CardActionPayload,
  ) => void
  opponents?: { index: number; name: string }[]
  onTransfer?: (
    fromIndex: number,
    toIndex: number,
    cardId: string,
    good: AdjustableGood,
    amount: number,
  ) => void
}

export function PlayerPanel({
  player,
  playerIndex,
  isCurrent,
  showScore = false,
  onConvert,
  onMoveAnimals,
  onAdjustForCard,
  onCardAction,
  opponents,
  onTransfer,
}: PlayerPanelProps) {
  const { t, i18n } = useTranslation()
  // Scored every render, not just at the end: players asked to see where they
  // stand mid-game. The same breakdown is shown either way — collapsed while
  // playing, open once the game is over.
  const score = scorePlayer(player)

  const accent = PLAYER_ACCENT[playerIndex % PLAYER_ACCENT.length]

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow',
        isCurrent && 'ring-2 ring-primary shadow-[var(--shadow-float)]',
      )}
    >
      {/* A band in the player's colour, so four panels side by side can be told
          apart from across the table without reading the names. */}
      <div aria-hidden className={cn('h-1.5 w-full bg-current', accent)} />

      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <PersonIcon className={cn('size-4', accent)} />
          {player.name}
          {isCurrent && (
            <span className="eyebrow rounded-full bg-highlight px-2 py-0.5 text-[9px] text-[var(--ink)] shadow-[var(--shadow-tile)]">
              {t('game.toAct')}
            </span>
          )}
        </CardTitle>
        <span className="text-xs font-semibold text-muted-foreground">
          {showScore
            ? t('game.points', { count: score.total })
            : `${t('game.workersRemaining', { count: workersLeft(player) })} · ${t('game.points', { count: score.total })}`}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-3">
        <Farmyard player={player} />

        <ul className="grid grid-cols-5 gap-1 text-center text-[11px]">
          {GOODS.map(({ key, tint }) => {
            const count = Number(player[key])
            return (
              <li
                key={key}
                className={cn(
                  'flex items-center justify-center gap-1 rounded-full border border-border/70',
                  'bg-muted px-1 py-1 font-semibold shadow-[var(--shadow-tile)]',
                  // An empty pile should not compete with a full one.
                  count === 0 && 'opacity-45',
                )}
                title={t(`goods.${key}` as 'goods.wood')}
              >
                <GoodIcon good={key} className={cn('size-3.5', tint)} />
                {/* The name was only in `title`, which no touch screen ever
                    shows — the same hover-only trap the card rules text fell
                    into. The icon is decoration; this is the actual label. */}
                <span className="sr-only">{t(`goods.${key}` as 'goods.wood')}: </span>
                <span className="tabular-nums">{count}</span>
              </li>
            )
          })}
        </ul>

        <p className="text-xs text-muted-foreground">
          {t('farm.summary', {
            people: t('farm.people', { count: player.people }),
            house: t(`house.${player.house}`),
            fences: player.fencesRemaining,
            stables: player.stablesRemaining,
            hand: player.hand.occupations.length + player.hand.minors.length,
          })}
          {player.beggingMarkers > 0 && (
            <span className="font-semibold text-destructive-text">
              {' · '}
              {t('farm.begging', { count: player.beggingMarkers })}
            </span>
          )}
        </p>

        {player.played.length > 0 && (
          <ul className="flex flex-col gap-1">
            {player.played.map((id) => {
              const card = cardById(id)
              if (!card) return null
              const localised = localiseCard(card, i18n.language)
              return (
                <li key={id}>
                  {/* The rules text used to live only in a `title` tooltip,
                      which never appears on a touch screen — the card's effect
                      was unreadable on a phone. */}
                  <details
                    className={cn(
                      'rounded-md border border-border bg-muted px-1.5 py-1',
                      'shadow-[var(--shadow-tile)] transition-colors hover:border-primary/40',
                      // A played card is a tile on the table; the stripe says
                      // at a glance whether the engine is applying it for you.
                      'border-l-4',
                      card.enforced ? 'border-l-primary' : 'border-l-border',
                    )}
                  >
                    <summary className="cursor-pointer text-[11px] font-semibold">
                      {localised.title}
                      {card.points !== 0 && (
                        <span className="text-muted-foreground">
                          {' '}
                          {t('cards.pointsShort', { count: card.points })}
                        </span>
                      )}
                      {!card.enforced && (
                        <span className="text-muted-foreground"> · {t('cards.manualShort')}</span>
                      )}
                    </summary>
                    <p className="mt-1 text-[11px] leading-snug font-normal text-muted-foreground">
                      {localised.text}
                    </p>
                  </details>
                </li>
              )
            })}
          </ul>
        )}

        {onMoveAnimals && !showScore && (
          <AnimalPanel player={player} playerIndex={playerIndex} onMove={onMoveAnimals} />
        )}

        {onConvert && !showScore && (
          <ConvertPanel player={player} playerIndex={playerIndex} onConvert={onConvert} />
        )}

        {onAdjustForCard && !showScore && (
          <AdjustPanel
            player={player}
            playerIndex={playerIndex}
            onAdjust={onAdjustForCard}
            onCardAction={onCardAction}
            opponents={opponents}
            onTransfer={onTransfer}
          />
        )}

        {(() => {
          const breakdown = (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              {Object.entries(score)
                .filter(([key]) => key !== 'total')
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t(`score.${key}` as 'score.fields')}</dt>
                    <dd className={cn('font-semibold', value < 0 && 'text-destructive-text')}>
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
          )

          // Final scores are the point of the end screen, so they stay open.
          return showScore ? (
            <div className="border-t border-border pt-2">{breakdown}</div>
          ) : (
            <details className="border-t border-border pt-2">
              <summary className="eyebrow cursor-pointer text-[10px] text-muted-foreground">
                {t('score.liveBreakdown', { count: score.total })}
              </summary>
              <div className="mt-1.5">{breakdown}</div>
            </details>
          )
        })()}
      </CardContent>
    </Card>
  )
}
