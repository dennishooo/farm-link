import { Farmyard } from '@/components/farmyard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cardById } from '@/game/cards'
import { workersLeft } from '@/game/engine'
import { scorePlayer } from '@/game/scoring'
import { cn } from '@/lib/utils'
import type { Player } from '@/game/types'

const GOODS: { key: keyof Player; label: string; icon: string }[] = [
  { key: 'wood', label: 'Wood', icon: '🪵' },
  { key: 'clay', label: 'Clay', icon: '🧱' },
  { key: 'reed', label: 'Reed', icon: '🌿' },
  { key: 'stone', label: 'Stone', icon: '🪨' },
  { key: 'grain', label: 'Grain', icon: '🌾' },
  { key: 'vegetable', label: 'Veg', icon: '🥕' },
  { key: 'food', label: 'Food', icon: '🍲' },
  { key: 'sheep', label: 'Sheep', icon: '🐑' },
  { key: 'boar', label: 'Boar', icon: '🐗' },
  { key: 'cattle', label: 'Cattle', icon: '🐄' },
]

type PlayerPanelProps = {
  player: Player
  isCurrent: boolean
  showScore?: boolean
}

export function PlayerPanel({ player, isCurrent, showScore = false }: PlayerPanelProps) {
  const score = showScore ? scorePlayer(player) : null

  return (
    <Card className={cn('overflow-hidden', isCurrent && 'ring-2 ring-primary')}>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          {player.name}
          {isCurrent && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              To act
            </span>
          )}
        </CardTitle>
        <span className="text-xs font-semibold text-muted-foreground">
          {score ? `${score.total} pts` : `${workersLeft(player)} left`}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-3">
        <Farmyard player={player} />

        <ul className="grid grid-cols-5 gap-1 text-center text-[11px]">
          {GOODS.map(({ key, label, icon }) => (
            <li
              key={key}
              className="rounded-sm bg-muted px-1 py-1 font-semibold"
              title={label}
            >
              <span aria-hidden>{icon}</span> {String(player[key])}
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          {player.people} {player.people === 1 ? 'person' : 'people'} · {player.house} house ·{' '}
          {player.fencesRemaining} fences · {player.stablesRemaining} stables ·{' '}
          {player.hand.occupations.length + player.hand.minors.length} in hand
          {player.beggingMarkers > 0 && (
            <span className="font-semibold text-destructive"> · {player.beggingMarkers} begging</span>
          )}
        </p>

        {player.played.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {player.played.map((id) => {
              const card = cardById(id)
              if (!card) return null
              return (
                <li
                  key={id}
                  title={card.text}
                  className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[11px] font-semibold"
                >
                  {card.title}
                  {card.points !== 0 && (
                    <span className="text-muted-foreground"> {card.points}pt</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {score && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-border pt-2 text-xs">
            {Object.entries(score)
              .filter(([key]) => key !== 'total')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </dt>
                  <dd className={cn('font-semibold', value < 0 && 'text-destructive')}>{value}</dd>
                </div>
              ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
