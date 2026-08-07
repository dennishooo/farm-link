import { useTranslation } from 'react-i18next'
import { accumulationRate, allSpacesFor } from '@/game/engine'
import { capacityFor } from '@/game/farm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActionSpaceId, AnimalType, GameState } from '@/game/types'

const ANIMALS: AnimalType[] = ['sheep', 'boar', 'cattle']

function isAnimal(good: string): good is AnimalType {
  return (ANIMALS as string[]).includes(good)
}

const GOOD_ICON: Record<string, string> = {
  wood: '🪵',
  clay: '🧱',
  reed: '🌿',
  stone: '🪨',
  food: '🍲',
  sheep: '🐑',
  boar: '🐗',
  cattle: '🐄',
}

type ActionBoardProps = {
  game: GameState
  onChoose: (spaceId: ActionSpaceId) => void
  disabled?: boolean
}

export function ActionBoard({ game, onChoose, disabled = false }: ActionBoardProps) {
  const { t } = useTranslation()
  const spaces = allSpacesFor(game.players.length).filter(
    (space) => space.stage === 0 || game.revealed.includes(space.id),
  )

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {spaces.map((space) => {
        const occupantId = game.occupied[space.id]
        const occupant = game.players.find((player) => player.id === occupantId)
        const amount = game.accumulated[space.id] ?? 0
        const isNew = game.revealed[game.revealed.length - 1] === space.id && space.stage !== 0

        // Animals with nowhere to live wander off (rulebook p.7). That is easy
        // to walk into unknowingly, so warn before the action rather than
        // reporting the loss in the log afterwards.
        const good = space.accumulates?.good
        const room =
          good && isAnimal(good) && amount > 0
            ? capacityFor(game.players[game.currentPlayerIndex], good)
            : null
        const wouldStray = room !== null ? Math.max(0, amount - room) : 0

        return (
          <li key={space.id}>
            <Button
              variant="outline"
              disabled={disabled || Boolean(occupant)}
              onClick={() => onChoose(space.id)}
              className={cn(
                'h-auto w-full flex-col items-start gap-1 px-3 py-2.5 text-left whitespace-normal',
                occupant && 'opacity-60',
                isNew && 'border-primary',
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-bold">{t(`spaces.${space.id}.name`, space.name)}</span>
                {space.accumulates && amount > 0 && (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                    {GOOD_ICON[space.accumulates.good] ?? ''} {amount}
                  </span>
                )}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {t(`spaces.${space.id}.description`, space.description)}
              </span>
              {space.accumulates && (
                <span className="text-xs font-normal text-muted-foreground">
                  {t('game.perRound', {
                    amount: accumulationRate(space, game.players.length),
                    good: t(`goods.${space.accumulates.good}` as 'goods.wood'),
                  })}
                </span>
              )}
              {!occupant && wouldStray > 0 && (
                <span className="text-xs font-semibold text-destructive">
                  {t('game.animalsWouldStray', { count: wouldStray })}
                </span>
              )}
              {occupant && (
                <span className="text-xs font-semibold text-destructive">
                  {t('game.takenBy', { name: occupant.name })}
                </span>
              )}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
