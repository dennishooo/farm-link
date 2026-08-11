import { useTranslation } from 'react-i18next'
import { accumulationRate, allSpacesFor } from '@/game/engine'
import { capacityFor } from '@/game/farm'
import { Button } from '@/components/ui/button'
import { GoodIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { ActionSpaceId, AnimalType, GameState } from '@/game/types'

const ANIMALS: AnimalType[] = ['sheep', 'boar', 'cattle']

function isAnimal(good: string): good is AnimalType {
  return (ANIMALS as string[]).includes(good)
}

/** The tint a space's accumulated goods are drawn in. */
const GOOD_TINT: Record<string, string> = {
  wood: 'text-wood',
  clay: 'text-clay',
  reed: 'text-reed',
  stone: 'text-stone',
  food: 'text-food',
  sheep: 'text-sheep',
  boar: 'text-boar',
  cattle: 'text-cattle',
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
                // Spaces that hand out goods carry a stripe in that good's
                // colour, so the board can be scanned for "where is the wood?"
                // without reading a single label.
                good && 'border-l-4',
                good && stripeFor(good),
                // A taken space is struck through with a hatch: still readable,
                // clearly out of play.
                occupant && 'hatch-taken opacity-70',
                isNew &&
                  'border-primary shadow-[var(--shadow-raised),0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]',
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-bold">{t(`spaces.${space.id}.name`, space.name)}</span>
                {space.accumulates && amount > 0 && (
                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-0.5',
                      'text-xs font-bold text-accent-foreground',
                      'shadow-[var(--shadow-tile)] ring-1 ring-highlight/30',
                    )}
                  >
                    <GoodIcon
                      good={space.accumulates.good}
                      className={cn('size-3.5', GOOD_TINT[space.accumulates.good])}
                    />
                    <span className="tabular-nums">{amount}</span>
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
                <span className="text-xs font-semibold text-destructive-text">
                  {t('game.animalsWouldStray', { count: wouldStray })}
                </span>
              )}
              {occupant && (
                <span className="text-xs font-semibold text-destructive-text">
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

/** Written out per good so Tailwind sees every class it has to generate. */
function stripeFor(good: string): string {
  switch (good) {
    case 'wood':
      return 'border-l-wood'
    case 'clay':
      return 'border-l-clay'
    case 'reed':
      return 'border-l-reed'
    case 'stone':
      return 'border-l-stone'
    case 'food':
      return 'border-l-food'
    case 'sheep':
      return 'border-l-sheep'
    case 'boar':
      return 'border-l-boar'
    case 'cattle':
      return 'border-l-cattle'
    default:
      return 'border-l-border'
  }
}
