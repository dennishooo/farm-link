import { allSpacesFor } from '@/game/engine'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActionSpaceId, GameState } from '@/game/types'

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
                <span className="font-bold">{space.name}</span>
                {space.accumulates && amount > 0 && (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                    {GOOD_ICON[space.accumulates.good] ?? ''} {amount}
                  </span>
                )}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{space.description}</span>
              {occupant && (
                <span className="text-xs font-semibold text-destructive">
                  Taken by {occupant.name}
                </span>
              )}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
