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
import type { Player } from '@/game/types'
import type { Payable } from '@/game/cards/types'
import type { AdjustableGood } from '@/game/engine'

const GOODS: { key: keyof Player; icon: string }[] = [
  { key: 'wood', icon: '🪵' },
  { key: 'clay', icon: '🧱' },
  { key: 'reed', icon: '🌿' },
  { key: 'stone', icon: '🪨' },
  { key: 'grain', icon: '🌾' },
  { key: 'vegetable', icon: '🥕' },
  { key: 'food', icon: '🍲' },
  { key: 'sheep', icon: '🐑' },
  { key: 'boar', icon: '🐗' },
  { key: 'cattle', icon: '🐄' },
]

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
}

export function PlayerPanel({
  player,
  playerIndex,
  isCurrent,
  showScore = false,
  onConvert,
  onMoveAnimals,
  onAdjustForCard,
}: PlayerPanelProps) {
  const { t, i18n } = useTranslation()
  // Scored every render, not just at the end: players asked to see where they
  // stand mid-game. The same breakdown is shown either way — collapsed while
  // playing, open once the game is over.
  const score = scorePlayer(player)

  return (
    <Card className={cn('overflow-hidden', isCurrent && 'ring-2 ring-primary')}>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          {player.name}
          {isCurrent && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
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
          {GOODS.map(({ key, icon }) => (
            <li
              key={key}
              className="rounded-sm bg-muted px-1 py-1 font-semibold"
              title={t(`goods.${key}` as 'goods.wood')}
            >
              <span aria-hidden>{icon}</span> {String(player[key])}
            </li>
          ))}
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
            <span className="font-semibold text-destructive">
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
                  <details className="rounded-sm border border-border bg-muted px-1.5 py-0.5">
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
          <AdjustPanel player={player} playerIndex={playerIndex} onAdjust={onAdjustForCard} />
        )}

        {(() => {
          const breakdown = (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              {Object.entries(score)
                .filter(([key]) => key !== 'total')
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t(`score.${key}` as 'score.fields')}</dt>
                    <dd className={cn('font-semibold', value < 0 && 'text-destructive')}>
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
              <summary className="cursor-pointer text-[11px] font-bold text-muted-foreground">
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
