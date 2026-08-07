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
import type { Player } from '@/game/types'
import type { Payable } from '@/game/cards/types'

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
}

export function PlayerPanel({
  player,
  playerIndex,
  isCurrent,
  showScore = false,
  onConvert,
  onMoveAnimals,
}: PlayerPanelProps) {
  const { t, i18n } = useTranslation()
  const score = showScore ? scorePlayer(player) : null

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
          {score
            ? t('game.points', { count: score.total })
            : t('game.workersRemaining', { count: workersLeft(player) })}
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
          <ul className="flex flex-wrap gap-1">
            {player.played.map((id) => {
              const card = cardById(id)
              if (!card) return null
              const localised = localiseCard(card, i18n.language)
              return (
                <li
                  key={id}
                  title={localised.text}
                  className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[11px] font-semibold"
                >
                  {localised.title}
                  {card.points !== 0 && (
                    <span className="text-muted-foreground">
                      {' '}
                      {t('cards.pointsShort', { count: card.points })}
                    </span>
                  )}
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

        {score && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-border pt-2 text-xs">
            {Object.entries(score)
              .filter(([key]) => key !== 'total')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{t(`score.${key}` as 'score.fields')}</dt>
                  <dd className={cn('font-semibold', value < 0 && 'text-destructive')}>{value}</dd>
                </div>
              ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
